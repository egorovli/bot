import type { CommandContext, Context } from 'grammy'
import type { Chat } from 'grammy/types'
import type { Logger } from '../../core/services/logger.ts'
import type { Agent } from '../../modules/messaging/entities/agent.ts'
import type { ConversationKind } from '../../modules/messaging/entities/conversation.ts'
import type { MessageKind } from '../../modules/messaging/entities/message.ts'
import type { RegisterConversationUseCase } from '../../modules/messaging/use-cases/register-conversation-use-case.ts'

import { Bot, GrammyError, HttpError } from 'grammy'

import type { RecordIncomingMessageUseCase } from '../../modules/messaging/use-cases/record-incoming-message-use-case.ts'
import type { PlanResponseUseCase } from '../../modules/messaging/use-cases/plan-response-use-case.ts'

interface MessagingBotOptions {
  token: string
  agent: Agent
  logger: Logger
  registerConversationUseCase: RegisterConversationUseCase
  recordIncomingMessageUseCase: RecordIncomingMessageUseCase
  planResponseUseCase: PlanResponseUseCase
}

export class GrammyBotRuntime {
  private readonly bot: Bot

  constructor(private readonly options: MessagingBotOptions) {
    this.bot = new Bot(this.options.token)
    this.configure()
  }

  async start() {
    this.options.logger.info('Starting messaging runtime')
    await this.bot.start({
      drop_pending_updates: true,
      onStart: async (botInfo) => {
        this.options.logger.info('Messaging runtime ready', {
          botId: botInfo.id,
          username: botInfo.username
        })
        await this.setBotProfile()
      }
    })
  }

  private configure() {
    this.bot.catch((err) => {
      const { error } = err
      if (error instanceof GrammyError) {
        this.options.logger.error('grammY request failed', {
          description: error.description
        })
        return
      }
      if (error instanceof HttpError) {
        this.options.logger.error('grammY network error', {
          cause: error.message
        })
        return
      }
      this.options.logger.error('Unexpected grammY error', { cause: error })
    })

    this.bot.command('start', async (ctx) => {
      await this.handleStart(ctx)
    })
  }

  private async handleStart(ctx: CommandContext<Context>) {
    if (!ctx.from || !ctx.chat || !ctx.message?.text) {
      this.options.logger.warn('Missing required context data for /start handler')
      return
    }

    const conversationId = ctx.chat.id.toString()
    const conversationKind = this.mapConversationKind(ctx.chat.type)
    const conversationTitle = this.resolveConversationTitle(ctx.chat)

    await this.options.registerConversationUseCase.execute({
      conversationId,
      kind: conversationKind,
      title: conversationTitle,
      ownerAgentId: this.options.agent.id
    })

    const { message } = await this.options.recordIncomingMessageUseCase.execute({
      messageId: ctx.message.message_id.toString(),
      kind: this.mapMessageKind(ctx.message.text),
      text: ctx.message.text,
      conversation: {
        id: conversationId,
        kind: conversationKind,
        title: conversationTitle,
        ownerAgentId: this.options.agent.id
      },
      participant: {
        id: ctx.from.id.toString(),
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name ?? undefined,
        handle: ctx.from.username ?? undefined,
        locale: ctx.from.language_code ?? undefined
      },
      sentAt: new Date(ctx.message.date * 1000)
    })

    const { plan } = await this.options.planResponseUseCase.execute({
      agent: this.options.agent,
      message
    })

    if (!plan) {
      this.options.logger.debug('No response plan generated for /start', {
        conversationId
      })
      return
    }

    const replyToMessageId = Number(plan.replyToMessageId ?? message.id)
    const replyOptions = Number.isNaN(replyToMessageId)
      ? undefined
      : { reply_to_message_id: replyToMessageId }

    await ctx.reply(plan.text, replyOptions)
  }

  private mapConversationKind(chatType: Chat['type']): ConversationKind {
    if (chatType === 'private') {
      return 'direct'
    }
    if (chatType === 'channel') {
      return 'broadcast'
    }
    return 'group'
  }

  private mapMessageKind(text: string): MessageKind {
    return text.trim().startsWith('/') ? 'command' : 'text'
  }

  private resolveConversationTitle(chat: Chat): string | undefined {
    if ('title' in chat && typeof chat.title === 'string') {
      return chat.title
    }
    if ('first_name' in chat && typeof chat.first_name === 'string') {
      const parts = [
        chat.first_name,
        'last_name' in chat && typeof chat.last_name === 'string' ? chat.last_name : undefined
      ].filter((value): value is string => typeof value === 'string' && value.length > 0)
      const title = parts.join(' ').trim()
      return title.length > 0 ? title : undefined
    }
    return undefined
  }

  private async setBotProfile() {
    try {
      // Set bot name (can only be called once per 24 hours)
      const botName = this.options.agent.displayName
      if (botName) {
        try {
          await this.bot.api.setMyName(botName)
          this.options.logger.info('Bot name set', { name: botName })
        } catch (error) {
          // Ignore throttling errors (setMyName can only be called once per 24 hours)
          if (error instanceof GrammyError) {
            const isThrottled = error.error_code === 429 || 
              error.description?.toLowerCase().includes('too often') ||
              error.description?.toLowerCase().includes('throttled') ||
              error.description?.toLowerCase().includes('24 hours')
            
            if (isThrottled) {
              this.options.logger.debug('Bot name update throttled (can only be set once per 24 hours)', {
                name: botName
              })
              // Continue to set profile picture even if name update is throttled
            } else {
              // Log other errors
              this.options.logger.warn('Failed to set bot name', {
                name: botName,
                cause: error instanceof Error ? error.message : String(error)
              })
            }
          } else {
            // Log non-Grammy errors
            this.options.logger.warn('Failed to set bot name', {
              name: botName,
              cause: error instanceof Error ? error.message : String(error)
            })
          }
        }
      }

      // Note: setMyPhoto is not available in the Telegram Bot API
      // Bot profile pictures can only be set manually through Telegram apps or BotFather
      // See: https://github.com/tdlib/telegram-bot-api/issues/652
    } catch (error) {
      this.options.logger.error('Failed to set bot profile', {
        cause: error instanceof Error ? error.message : String(error)
      })
    }
  }
}

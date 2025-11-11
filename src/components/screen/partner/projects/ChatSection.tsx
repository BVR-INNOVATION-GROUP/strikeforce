/**
 * ChatSection - displays project chat messages with link to full chat
 */
import Avatar from '@/src/components/core/Avatar'

export interface MessageI {
    id: string
    sender: string
    text: string
    timestamp: string
    avatar?: string
}

export interface Props {
    messages: MessageI[]
    onOpenFullChat: () => void
}

const ChatSection = (props: Props) => {
    const { messages } = props

    // Show only last 2 messages
    const displayMessages = messages.slice(-2)

    return (
        <div className="flex flex-col gap-4">
            {displayMessages.map((msg) => (
                <div key={msg.id} className="rounded-lg p-6 bg-pale">
                    <div className="flex items-center gap-3 mb-3">
                        {msg.avatar && <Avatar src={msg.avatar} alt={msg.sender} size="sm" />}
                        <span className="text-[0.875rem] font-[600]">{msg.sender}</span>
                        <span className="text-[0.8125rem] opacity-60">
                            {new Date(msg.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <p className="text-[0.875rem] opacity-60 leading-relaxed">{msg.text}</p>
                </div>
            ))}
        </div>
    )
}

export default ChatSection


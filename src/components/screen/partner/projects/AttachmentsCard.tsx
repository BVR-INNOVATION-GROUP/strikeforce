/**
 * AttachmentsCard - displays project attachments
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import { File, ExternalLink } from 'lucide-react'

export interface Props {
  attachments: string[]
}

/**
 * Format file name from URL
 */
const getFileName = (url: string): string => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const fileName = pathname.split('/').pop() || 'attachment'
    return decodeURIComponent(fileName)
  } catch {
    // If URL parsing fails, extract filename from path
    const parts = url.split('/')
    return parts[parts.length - 1] || 'attachment'
  }
}

/**
 * Get file extension for icon styling
 */
const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

const AttachmentsCard = (props: Props) => {
  const { attachments } = props

  if (!attachments || attachments.length === 0) {
    return null
  }

  return (
    <Card title="Project Attachments">
      <div className="flex flex-col gap-3">
        {attachments.map((attachment, index) => {
          const fileName = getFileName(attachment)
          const extension = getFileExtension(fileName)

          return (
            <a
              key={index}
              href={attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg bg-pale hover:bg-very-pale transition-colors group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-very-pale flex items-center justify-center">
                  <File size={18} className="opacity-60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.875rem] font-[600] truncate mb-1">{fileName}</p>
                  <p className="text-[0.8125rem] opacity-60">{extension.toUpperCase()} file</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ExternalLink size={16} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </a>
          )
        })}
      </div>
    </Card>
  )
}

export default AttachmentsCard


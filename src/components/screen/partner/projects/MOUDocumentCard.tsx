/**
 * MOU Document Card - displays the Memorandum of Understanding PDF
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import { FileText, ExternalLink, Download, CheckCircle } from 'lucide-react'
import Button from '@/src/components/core/Button'

export interface Props {
  mouUrl?: string
  projectTitle?: string
}

const MOUDocumentCard = (props: Props) => {
  const { mouUrl, projectTitle } = props
  const [downloadError, setDownloadError] = React.useState<string | null>(null)

  if (!mouUrl) {
    return null
  }

  const handleDownload = async () => {
    setDownloadError(null)
    try {
      // For Cloudinary URLs, try to fetch and create blob for download
      // This works better for cross-origin resources
      const response = await fetch(mouUrl, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
      })
      
      if (!response.ok) {
        // If fetch fails with 401, the file might not be publicly accessible
        if (response.status === 401) {
          setDownloadError('File access denied. Please check Cloudinary settings to ensure the file is publicly accessible.')
          // Still try to open in new tab as fallback
          window.open(mouUrl, '_blank')
          return
        }
        throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`)
      }
      
      // Create blob from response
      const blob = await response.blob()
      
      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob)
      
      // Create temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `MOU-${projectTitle?.replace(/\s+/g, '-') || 'project'}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error('Failed to download MOU:', error)
      setDownloadError('Failed to download. Opening in new tab instead.')
      // Fallback: open in new tab
      setTimeout(() => {
        window.open(mouUrl, '_blank', 'noopener,noreferrer')
      }, 500)
    }
  }

  const handleView = () => {
    // Open directly in new tab - Cloudinary URLs should work for viewing
    window.open(mouUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card title="Memorandum of Understanding (MOU)">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 mb-1">
              MOU Generated
            </p>
            <p className="text-xs text-green-700">
              This project has been approved and a Memorandum of Understanding has been generated 
              with both partner and university admin signatures.
            </p>
          </div>
        </div>

        <div
          onClick={handleView}
          className="flex items-center justify-between p-4 rounded-lg bg-pale hover:bg-very-pale transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.875rem] font-[600] truncate mb-1">
                Memorandum of Understanding
              </p>
              <p className="text-[0.8125rem] opacity-60">PDF Document</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ExternalLink size={18} className="opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {downloadError && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">{downloadError}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleDownload}
            className="bg-primary text-white flex-1"
          >
            <Download size={16} className="mr-2" />
            Download MOU
          </Button>
          <Button
            onClick={handleView}
            className="bg-pale text-primary flex-1"
          >
            <ExternalLink size={16} className="mr-2" />
            View in New Tab
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default MOUDocumentCard


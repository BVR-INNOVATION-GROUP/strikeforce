/**
 * ApplicationDetailModal - comprehensive view of application details
 * Shows full application information including statement, scores, student profiles, and portfolio
 */
"use client";

import React, { useEffect, useState } from 'react'
import Modal from '@/src/components/base/Modal'
import Button from '@/src/components/core/Button'
import StatusIndicator from '@/src/components/core/StatusIndicator'
import Avatar from '@/src/components/core/Avatar'
import Card from '@/src/components/core/Card'
import { ApplicationI } from '@/src/models/application'
import { UserI } from '@/src/models/user'
import { PortfolioItemI } from '@/src/models/portfolio'
import { userRepository } from '@/src/repositories/userRepository'
import { portfolioService } from '@/src/services/portfolioService'
import { Calendar, Award, TrendingUp, CheckCircle, XCircle, FileText, Download, ExternalLink } from 'lucide-react'
import { formatDateLong } from '@/src/utils/dateFormatters'

export interface Props {
    open: boolean
    onClose: () => void
    application: ApplicationI | null
    applicationDisplay?: {
        id: number
        groupName: string
        members: Array<{ name: string; avatar: string }>
        status: string
        portfolioScore: number
        appliedAt: string
    }
}

const ApplicationDetailModal = (props: Props) => {
    const { open, onClose, application, applicationDisplay } = props
    const [students, setStudents] = useState<UserI[]>([])
    const [portfolioItems, setPortfolioItems] = useState<PortfolioItemI[]>([])
    const [loading, setLoading] = useState(false)

    /**
     * Load student profiles and portfolio data
     */
    useEffect(() => {
        const loadData = async () => {
            if (!application || !open) return

            setLoading(true)
            try {
                // Load student user profiles
                const allUsers = await userRepository.getAll()
                const applicationStudents = allUsers.filter(user =>
                    application.studentIds.includes(user.id)
                )
                setStudents(applicationStudents)

                // Load portfolio items for all students
                const portfolioPromises = applicationStudents.map(student =>
                    portfolioService.getUserPortfolio(student.id?.toString()).catch(() => [])
                )
                const portfolios = await Promise.all(portfolioPromises)
                setPortfolioItems(portfolios.flat())
            } catch (error) {
                console.error('Failed to load application details:', error)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [application, open])

    if (!application) return null

    const score = application.score
    const isGroup = application.applicantType === 'GROUP'

    return (
        <Modal
            title={`Application Details - ${applicationDisplay?.groupName || 'Application'}`}
            open={open}
            handleClose={onClose}
            actions={[
                <Button
                    key="close"
                    onClick={onClose}
                    className="bg-pale text-[0.875rem]"
                >
                    Close
                </Button>
            ]}
        >
            <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto pr-2">
                {/* Application Status and Overview */}
                <Card title="Application Overview">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[0.8125rem] opacity-60 mb-1">Application Type</p>
                            <p className="text-[0.875rem] font-medium capitalize">
                                {application.applicantType.toLowerCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-[0.8125rem] opacity-60 mb-1">Status</p>
                            <StatusIndicator status={application.status} />
                        </div>
                        <div>
                            <p className="text-[0.8125rem] opacity-60 mb-1">Applied Date</p>
                            <p className="text-[0.875rem] font-medium">
                                {formatDateLong(application.createdAt)}
                            </p>
                        </div>
                        {application.updatedAt !== application.createdAt && (
                            <div>
                                <p className="text-[0.8125rem] opacity-60 mb-1">Last Updated</p>
                                <p className="text-[0.875rem] font-medium">
                                    {formatDateLong(application.updatedAt)}
                                </p>
                            </div>
                        )}
                        {application.offerExpiresAt && (
                            <div>
                                <p className="text-[0.8125rem] opacity-60 mb-1">Offer Expires</p>
                                <p className="text-[0.875rem] font-medium">
                                    {formatDateLong(application.offerExpiresAt)}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Application Statement */}
                <Card title="Application Statement">
                    <div
                        className="prose max-w-none text-[0.875rem] leading-relaxed opacity-80"
                        dangerouslySetInnerHTML={{
                            __html: application.statement || '<p class="opacity-60">No statement provided.</p>'
                        }}
                    />
                </Card>

                {/* Attachments */}
                {application.attachments && application.attachments.length > 0 && (
                    <Card title="Attachments (CVs, Portfolios, etc.)">
                        <div className="space-y-2">
                            {application.attachments.map((attachment, index) => {
                                const fileName = attachment.split('/').pop() || `Attachment ${index + 1}`;
                                const isImage = /\.(jpg|jpeg|png|gif)$/i.test(attachment);
                                const isPdf = /\.pdf$/i.test(attachment);

                                return (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-paper rounded-lg border border-pale hover:bg-very-pale transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <FileText size={18} className="opacity-60 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[0.875rem] font-medium truncate">
                                                    {fileName}
                                                </p>
                                                <p className="text-[0.75rem] opacity-60">
                                                    {isImage ? 'Image' : isPdf ? 'PDF Document' : 'Document'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <a
                                                href={attachment}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded hover:bg-pale transition-colors"
                                                title="Open in new tab"
                                            >
                                                <ExternalLink size={16} className="opacity-60" />
                                            </a>
                                            <a
                                                href={attachment}
                                                download
                                                className="p-2 rounded hover:bg-pale transition-colors"
                                                title="Download"
                                            >
                                                <Download size={16} className="opacity-60" />
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                {/* Score Breakdown */}
                {score && (
                    <Card title="Application Score">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-pale rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Award size={20} className="text-primary" />
                                    <div>
                                        <p className="text-[0.8125rem] opacity-60">Final Score</p>
                                        <p className="text-[1.25rem] font-bold text-primary">
                                            {score.finalScore} / 100
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-paper rounded-lg border border-pale">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp size={16} className="opacity-60" />
                                        <p className="text-[0.8125rem] opacity-60">Auto Score</p>
                                    </div>
                                    <p className="text-[0.9375rem] font-semibold">
                                        {score.autoScore} / 100
                                    </p>
                                </div>
                                <div className="p-3 bg-paper rounded-lg border border-pale">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={16} className="opacity-60" />
                                        <p className="text-[0.8125rem] opacity-60">Portfolio Score</p>
                                    </div>
                                    <p className="text-[0.9375rem] font-semibold">
                                        {score.portfolioScore} / 100
                                    </p>
                                </div>
                                {score.manualPartnerScore !== undefined && (
                                    <div className="p-3 bg-paper rounded-lg border border-pale">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText size={16} className="opacity-60" />
                                            <p className="text-[0.8125rem] opacity-60">Partner Score</p>
                                        </div>
                                        <p className="text-[0.9375rem] font-semibold">
                                            {score.manualPartnerScore} / 100
                                        </p>
                                    </div>
                                )}
                                {score.manualSupervisorScore !== undefined && (
                                    <div className="p-3 bg-paper rounded-lg border border-pale">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText size={16} className="opacity-60" />
                                            <p className="text-[0.8125rem] opacity-60">Supervisor Score</p>
                                        </div>
                                        <p className="text-[0.9375rem] font-semibold">
                                            {score.manualSupervisorScore} / 100
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-pale">
                                <div>
                                    <p className="text-[0.8125rem] opacity-60 mb-1">Skill Match</p>
                                    <p className="text-[0.875rem] font-medium">{score.skillMatch}%</p>
                                </div>
                                <div>
                                    <p className="text-[0.8125rem] opacity-60 mb-1">Rating Score</p>
                                    <p className="text-[0.875rem] font-medium">{score.ratingScore} / 100</p>
                                </div>
                                <div>
                                    <p className="text-[0.8125rem] opacity-60 mb-1">On-Time Rate</p>
                                    <div className="flex items-center gap-2">
                                        {score.onTimeRate >= 0.8 ? (
                                            <CheckCircle size={16} className="text-green-500" />
                                        ) : (
                                            <XCircle size={16} className="text-yellow-500" />
                                        )}
                                        <p className="text-[0.875rem] font-medium">
                                            {(score.onTimeRate * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[0.8125rem] opacity-60 mb-1">Rework Rate</p>
                                    <p className="text-[0.875rem] font-medium">
                                        {(score.reworkRate * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Students/Group Members */}
                <Card title={isGroup ? "Group Members" : "Student Profile"}>
                    {loading ? (
                        <p className="text-[0.875rem] opacity-60">Loading student information...</p>
                    ) : students.length > 0 ? (
                        <div className="space-y-4">
                            {students.map((student) => (
                                <div key={student.id} className="p-4 bg-paper rounded-lg border border-pale">
                                    <div className="flex items-start gap-4">
                                        <Avatar
                                            src={student.profile?.avatar}
                                            alt={student.name}
                                            size="md"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-[0.9375rem] font-semibold mb-1">
                                                {student.name}
                                            </h4>
                                            <p className="text-[0.8125rem] opacity-60 mb-2">
                                                {student.email}
                                            </p>
                                            {student.profile?.bio && (
                                                <p className="text-[0.8125rem] opacity-80 mb-2">
                                                    {student.profile.bio}
                                                </p>
                                            )}
                                            {student.profile?.skills && student.profile.skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {student.profile.skills.map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-pale-primary text-primary rounded text-[0.75rem]"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {student.profile?.location && (
                                                <p className="text-[0.8125rem] opacity-60 mt-2">
                                                    📍 {student.profile.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[0.875rem] opacity-60 bg-paper p-4 rounded-lg">No student information available.</p>
                    )}
                </Card>

                {/* Portfolio Items */}
                {portfolioItems.length > 0 && (
                    <Card title="Portfolio & Previous Work">
                        <div className="space-y-3">
                            {portfolioItems.map((item) => (
                                <div key={item.id} className="p-4 bg-paper rounded-lg border border-pale">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h5 className="text-[0.875rem] font-semibold mb-1">
                                                {item.scope}
                                            </h5>
                                            <p className="text-[0.8125rem] opacity-60">
                                                Role: {item.role}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[0.8125rem] font-medium">
                                                {item.currency} {item.amountDelivered.toLocaleString()}
                                            </p>
                                            <p className="text-[0.75rem] opacity-60 capitalize">
                                                {item.complexity.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-pale">
                                        {item.rating && (
                                            <div className="flex items-center gap-1">
                                                <Award size={14} className="opacity-60" />
                                                <span className="text-[0.8125rem]">
                                                    {item.rating} / 5
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            {item.onTime ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : (
                                                <XCircle size={14} className="text-yellow-500" />
                                            )}
                                            <span className="text-[0.8125rem] opacity-60">
                                                {item.onTime ? 'On Time' : 'Delayed'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} className="opacity-60" />
                                            <span className="text-[0.8125rem] opacity-60">
                                                {formatDateLong(item.verifiedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </Modal>
    )
}

export default ApplicationDetailModal


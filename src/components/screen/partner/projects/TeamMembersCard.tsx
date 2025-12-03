/**
 * TeamMembersCard - displays assigned team members with badges
 * Shows all team members with badges for leader, supervisor, and current user
 */
import React from 'react'
import Card from '@/src/components/core/Card'
import Avatar from '@/src/components/core/Avatar'
import { Crown, GraduationCap, User } from 'lucide-react'

export interface Props {
    teamMembers: Array<{
        id: string
        name: string
        role: string
        avatar: string
        badges: {
            isLeader: boolean
            isSupervisor: boolean
            isYou: boolean
        }
    }>
}

const TeamMembersCard = (props: Props) => {
    const { teamMembers } = props

    return (
        <Card title="Assigned Team">
            <div className="flex flex-col gap-4">
                {teamMembers.map((member) => {
                    // Safety check: provide default badges if missing
                    const badges = member.badges || {
                        isLeader: false,
                        isSupervisor: false,
                        isYou: false
                    }
                    type BadgeInfo = { icon: typeof Crown; label: string; color: string }
                    const activeBadges: BadgeInfo[] = [
                        badges.isLeader && { icon: Crown, label: "Leader", color: "bg-yellow-500" },
                        badges.isSupervisor && { icon: GraduationCap, label: "Supervisor", color: "bg-blue-500" },
                        badges.isYou && { icon: User, label: "You", color: "bg-primary" }
                    ].filter((badge): badge is BadgeInfo => Boolean(badge))

                    return (
                        <div key={member.id} className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar
                                    src={member.avatar || undefined}
                                    alt={member.name}
                                    name={member.name}
                                />
                                {activeBadges.length > 0 && (
                                    <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                                        {activeBadges.map((badge, idx) => {
                                            const BadgeIcon = badge.icon
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`${badge.color} rounded-full p-1 flex items-center justify-center border-2 border-paper`}
                                                    title={badge.label}
                                                >
                                                    <BadgeIcon size={10} className="text-white" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="text-[0.875rem] font-[600]">{member.name}</p>
                                </div>
                                <p className="text-[0.8125rem] opacity-60 mt-1">{member.role}</p>
                            </div>
                        </div>
                    )
                })}
                {teamMembers.length === 0 && (
                    <p className="text-[0.875rem] opacity-60 text-center py-4">
                        No team members assigned yet
                    </p>
                )}
            </div>
        </Card>
    )
}

export default TeamMembersCard


import React, { HTMLAttributes, ReactNode } from 'react'

export interface Props extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode
  indicator?: boolean
  disableShrink?: boolean
}

const IconButton = ({ icon, indicator, disableShrink, className, ...attr }: Props) => {
  return (
    <div {...attr} className={`rounded-full h-13  w-13 flex items-center justify-center ${className}`}>
      <span className={`${!disableShrink && "transform scale-[.8]"}`}>
        {icon}
        {indicator && (
          <div className="absolute rounded-full h-3 w-3 border border-pale right-0 top-0 bg-primary"></div>
        )}
      </span>


    </div>
  )
}

export default IconButton
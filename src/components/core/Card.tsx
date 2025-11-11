"use client";

import React, { HTMLAttributes, ReactNode } from "react";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}

/**
 * Card component for content containers
 */
const Card = ({ children, title, actions, className = "", ...props }: Props) => {
  return (
    <div
      className={`bg-paper rounded-lg shadow-custom  p-8 ${className}`}
      {...props}
    >
      {(title || actions) && (
        <div className="flex justify-between items-center mb-6">
          {title && <h3 className="text-[1rem] font-[600]">{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;



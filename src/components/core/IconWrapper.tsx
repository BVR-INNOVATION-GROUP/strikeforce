"use client";

import React, { ReactElement, cloneElement } from 'react';

/**
 * IconWrapper - Wraps icon components to suppress hydration warnings
 * caused by browser extensions (like Dark Reader) that modify SVG attributes
 */
interface IconWrapperProps {
  icon: ReactElement;
}

const IconWrapper: React.FC<IconWrapperProps> = ({ icon }) => {
  // Clone the icon element and add suppressHydrationWarning to SVG elements
  const wrappedIcon = React.Children.map(icon, (child) => {
    if (React.isValidElement(child)) {
      // If it's an SVG element, add suppressHydrationWarning
      if (child.type === 'svg' || (child.props && child.props.xmlns)) {
        return cloneElement(child as ReactElement<any>, {
          suppressHydrationWarning: true,
        });
      }
      // Recursively handle children
      if (child.props && child.props.children) {
        return cloneElement(child as ReactElement<any>, {
          children: React.Children.map(child.props.children, (grandChild) => {
            if (React.isValidElement(grandChild) && grandChild.type === 'svg') {
              return cloneElement(grandChild as ReactElement<any>, {
                suppressHydrationWarning: true,
              });
            }
            return grandChild;
          }),
        });
      }
    }
    return child;
  });

  return <>{wrappedIcon}</>;
};

export default IconWrapper;









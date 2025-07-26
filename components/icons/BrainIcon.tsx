import React from 'react';

interface BrainIconProps {
  className?: string;
}

const BrainIcon: React.FC<BrainIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C10.6868 2 9.5 3.18677 9.5 4.5C9.5 4.79743 9.55873 5.07951 9.66667 5.33333C8.66667 5.33333 7.83333 6.16667 7.83333 7.16667C7.83333 7.43333 7.9 7.7 8 7.93333C7.26667 8.26667 6.83333 9 6.83333 9.83333C6.83333 10.4 7.06667 10.9 7.5 11.1667C7.06667 11.5 6.83333 12 6.83333 12.5C6.83333 13.3333 7.33333 14 8.16667 14.1667C8.06667 14.3333 8 14.5 8 14.8333C8 15.6667 8.66667 16.3333 9.5 16.3333H10.1667V19.5C10.1667 20.6 11.0667 21.5 12.1667 21.5C13.2667 21.5 14.1667 20.6 14.1667 19.5V16.3333H14.8333C15.6667 16.3333 16.3333 15.6667 16.3333 14.8333C16.3333 14.5 16.2667 14.3333 16.1667 14.1667C17 14 17.5 13.3333 17.5 12.5C17.5 12 17.2667 11.5 16.8333 11.1667C17.2667 10.9 17.5 10.4 17.5 9.83333C17.5 9 17.0667 8.26667 16.3333 7.93333C16.4333 7.7 16.5 7.43333 16.5 7.16667C16.5 6.16667 15.6667 5.33333 14.6667 5.33333C14.7746 5.07951 14.8333 4.79743 14.8333 4.5C14.8333 3.18677 13.6465 2 12.3333 2H12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 9.5H9.51"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 9.5H14.51"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default BrainIcon;
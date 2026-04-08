export default function CannabisLeaf({ className = '', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 22V12" />
      <path d="M12 12C12 12 8.5 14 6 14C3.5 14 2 12.5 2 10.5C2 8.5 4 7.5 6 8C4 6 3.5 3 5.5 1.5C7 3.5 9 5 12 6C15 5 17 3.5 18.5 1.5C20.5 3 20 6 18 8C20 7.5 22 8.5 22 10.5C22 12.5 20.5 14 18 14C15.5 14 12 12 12 12Z" />
      <path d="M12 6C12 6 10 8.5 10 12" />
      <path d="M12 6C12 6 14 8.5 14 12" />
    </svg>
  );
}

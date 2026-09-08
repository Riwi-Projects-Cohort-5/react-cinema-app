import { ArrowRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@shared/utils/cn";

interface IconLinkProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
}

export function IconLink({ children, to, onClick, className }: IconLinkProps) {
  const classes = cn(
    "group inline-flex items-center gap-1 text-caption font-medium text-primary transition-colors duration-fast hover:text-primary-hover",
    className
  );

  const content = (
    <>
      <span>{children}</span>
      <ArrowRight
        size={16}
        className="shrink-0 transition-transform duration-fast group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

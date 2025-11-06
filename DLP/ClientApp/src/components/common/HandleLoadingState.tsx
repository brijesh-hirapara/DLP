import React, { ReactNode } from "react";

interface HandleLoadingStateProps {
  isLoading: boolean;
  loadingPlaceholder: ReactNode;
  children?: ReactNode;
}

const HandleLoadingState = ({
  isLoading,
  loadingPlaceholder,
  children,
}: HandleLoadingStateProps) => {
  if (isLoading) {
    return <>{loadingPlaceholder}</>;
  }

  return <>{children}</>;
};

export default HandleLoadingState;

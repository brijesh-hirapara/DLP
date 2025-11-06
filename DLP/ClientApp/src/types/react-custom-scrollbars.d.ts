declare module 'react-custom-scrollbars' {
    import * as React from 'react';
  
    export interface ScrollbarProps {
      autoHide?: boolean;
      autoHideTimeout?: number;
      autoHideDuration?: number;
      renderTrackHorizontal?: (props: any) => React.ReactNode;
      renderTrackVertical?: (props: any) => React.ReactNode;
      renderThumbHorizontal?: (props: any) => React.ReactNode;
      renderThumbVertical?: (props: any) => React.ReactNode;
      renderView?: (props: any) => React.ReactNode;
      children?: React.ReactNode;
      [key: string]: any;
    }
  
    export class Scrollbars extends React.Component<ScrollbarProps> {}
  }
  
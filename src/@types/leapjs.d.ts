declare module 'leapjs' {
  export interface Hand {

  }

  export interface Pointable {
    touchZone: string;
  }

  export interface Frame {
    hands: Hand[];
    fingers: Pointable[];
  }

  export interface Leap {
    loop(options: {
      host?: string,
      port?: string,
      background?: boolean,
      optimizeHMD?: boolean,
      frameEventName?: string,
      useAllPlugins?: boolean,
      loopWhileDisconnected?: boolean
    }, callback: (frame: Frame) => void): void;
  }

  let leap: Leap;
  export default leap;
}

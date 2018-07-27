declare module 'play-sound' {
  export class Play {
    play(what: string, options: any, next: (error: Error) => void): void;
  }

  export default function(options?: any): Play;
}

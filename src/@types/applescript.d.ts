declare module 'applescript' {
  class AppleScript {
    execString(script: string, callback: (error: Error, rtn: any) => void): void;
  }
  let as: AppleScript;
  export default as;
}

declare module '@google-cloud/text-to-speech' {
  export interface SynthesisInput {
    text?: string;
    ssml?: string;
  }

  export interface VoiceSelectionParams {
    languageCode: string;
    name?: string;
    ssmlGender?: string;
  }

  export interface SynthesizeSpeechResponse {
    audioContent: Buffer;
  }

  export interface ListVoicesResponse {
    voices: {name: string, ssmlGender: string, naturalSampleRateHertz: string, languageCodes: string[]};
  }

  export interface AudioConfig {
    audioEncoding: string;
    speakingRate?: number;
    pitch?: number;
    voiceGainDb?: number;
    sampleRateHertz?: number;
    effectsProfileId?: string[];
  }

  export class TextToSpeechClient {
    synthesizeSpeech(request: {
      input: SynthesisInput,
      voice: VoiceSelectionParams,
      audioConfig: AudioConfig
    }, options?: any, callback?: (error: Error, response: SynthesizeSpeechResponse) => void): Promise<SynthesizeSpeechResponse[]> | void;
    listVoices(request: VoiceSelectionParams, options?: any, callback?: (error: Error, response: ListVoicesResponse) => void): Promise<ListVoicesResponse[]> | void;
  }
}

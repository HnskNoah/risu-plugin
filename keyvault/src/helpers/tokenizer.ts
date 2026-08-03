export const LLMTokenizer = {
  Unknown: 0,
  tiktokenCl100kBase: 1,
  tiktokenO200Base: 2,
  Mistral: 3,
  Llama: 4,
  NovelAI: 5,
  Claude: 6,
  NovelList: 7,
  Llama3: 8,
  Gemma: 9,
  GoogleCloud: 10,
  Cohere: 11,
  Local: 12,
  DeepSeek: 13,
  DeepSeekV4: 14,
  GLM4: 15,
  GLM5: 16,
} as const

export type LLMTokenizerValue = (typeof LLMTokenizer)[keyof typeof LLMTokenizer]

export const inferTokenizer = (modelName: string): LLMTokenizerValue => {
  const name = modelName.toLowerCase()
  if (name.includes("deepseek")) {
    return LLMTokenizer.DeepSeekV4
  }
  if (name.includes("claude")) {
    return LLMTokenizer.Claude
  }
  if (name.includes("gemini")) {
    return LLMTokenizer.GoogleCloud
  }
  if (name.includes("gemma")) {
    return LLMTokenizer.Gemma
  }
  if (name.includes("mimo")) {
    return LLMTokenizer.tiktokenCl100kBase
  }
  if (name.includes("gpt-4o") || name.includes("gpt-5") || name.includes("o1") || name.includes("o3")) {
    return LLMTokenizer.tiktokenO200Base
  }
  if (name.includes("gpt-")) {
    return LLMTokenizer.tiktokenCl100kBase
  }
  if (name.includes("llama3") || name.includes("llama-3")) {
    return LLMTokenizer.Llama3
  }
  if (name.includes("llama")) {
    return LLMTokenizer.Llama
  }
  if (name.includes("mistral")) {
    return LLMTokenizer.Mistral
  }
  if (name.includes("glm")) {
    return LLMTokenizer.GLM5
  }
  if (name.includes("cohere")) {
    return LLMTokenizer.Cohere
  }
  return LLMTokenizer.tiktokenO200Base
}

import { createClient } from "@/lib/supabase-client"

export interface Translation {
  id: number
  category: string
  chinese_term: string
  english_term: string
  description?: string
  created_at: string
  updated_at: string
}

/**
 * 從翻譯表中獲取特定類別的所有翻譯
 * @param category 翻譯類別 (process, material, surface_treatment, inspection, packaging)
 * @returns 翻譯列表
 */
export async function getTranslationsByCategory(category: string): Promise<Translation[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("category", category)
    .order("chinese_term", { ascending: true })

  if (error) {
    console.error("獲取翻譯失敗:", error)
    return []
  }

  return data || []
}

/**
 * 根據中文術語獲取英文翻譯
 * @param chineseTerm 中文術語
 * @param category 翻譯類別 (可選)
 * @returns 英文翻譯，如果未找到則返回原中文術語
 */
export async function getEnglishTranslation(chineseTerm: string, category?: string): Promise<string> {
  if (!chineseTerm) return ""

  const supabase = createClient()

  let query = supabase.from("translations").select("english_term").eq("chinese_term", chineseTerm)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query.limit(1)

  if (error || !data || data.length === 0) {
    console.warn(`未找到「${chineseTerm}」的翻譯`, error)
    return chineseTerm // 如果未找到翻譯，返回原中文術語
  }

  return data[0].english_term
}

/**
 * 批量翻譯中文術語為英文
 * @param chineseTerms 中文術語數組
 * @param category 翻譯類別 (可選)
 * @returns 英文翻譯數組，未找到翻譯的項目將保持原中文
 */
export async function batchTranslate(chineseTerms: string[], category?: string): Promise<string[]> {
  if (!chineseTerms || chineseTerms.length === 0) {
    return []
  }

  const supabase = createClient()

  // 首先嘗試精確匹配完整術語
  let query = supabase.from("translations").select("chinese_term, english_term").in("chinese_term", chineseTerms)

  if (category) {
    query = query.eq("category", category)
  }

  const { data, error } = await query

  if (error) {
    console.error("批量翻譯失敗:", error)
    return chineseTerms // 如果查詢失敗，返回原中文術語
  }

  // 創建翻譯映射
  const translationMap = new Map<string, string>()
  ;(data || []).forEach((item) => {
    translationMap.set(item.chinese_term, item.english_term)
  })

  // 對於未找到精確匹配的術語，嘗試部分匹配
  const notFoundTerms = chineseTerms.filter((term) => !translationMap.has(term))

  if (notFoundTerms.length > 0) {
    // 獲取所有翻譯
    const { data: allTranslations } = await supabase
      .from("translations")
      .select("chinese_term, english_term")
      .order("chinese_term", { ascending: false }) // 先嘗試匹配較長的術語

    if (allTranslations) {
      // 對於每個未找到的術語，嘗試部分匹配
      for (const term of notFoundTerms) {
        // 如果術語很短，跳過部分匹配
        if (term.length < 2) continue

        let translated = term
        // 嘗試替換術語中的已知部分
        for (const translation of allTranslations) {
          if (term.includes(translation.chinese_term)) {
            translated = translated.replace(translation.chinese_term, translation.english_term)
          }
        }

        // 如果有部分被翻譯，添加到映射
        if (translated !== term) {
          translationMap.set(term, translated)
        }
      }
    }
  }

  // 翻譯每個術語，如果未找到翻譯則保留原中文
  return chineseTerms.map((term) => translationMap.get(term) || term)
}

/**
 * 將製程描述翻譯為英文並格式化為訂單備註
 * @param processes 製程描述數組
 * @param useTranslation 是否使用翻譯
 * @returns 格式化的製程描述
 */
export async function formatProcessesForOrderRemarks(processes: string[], useTranslation = false): Promise<string> {
  if (!processes || processes.length === 0) {
    return ""
  }

  let processTerms = processes

  if (useTranslation) {
    // 如果需要翻譯，則獲取英文翻譯
    processTerms = await batchTranslate(processes, "process")
    // 格式化為英文訂單備註格式
    return "MANUFACTURING PROCESS:\n" + processTerms.map((process) => `- ${process}`).join("\n")
  } else {
    // 不翻譯，使用原中文
    return "製程要求:\n" + processTerms.map((process) => `- ${process}`).join("\n")
  }
}

// 同步版本的翻譯函數，用於避免在渲染過程中的異步操作
export function getTranslationSync(translations: Translation[], chineseTerm: string): string {
  if (!chineseTerm || !translations || translations.length === 0) return chineseTerm

  const translation = translations.find((t) => t.chinese_term === chineseTerm)
  return translation ? translation.english_term : chineseTerm
}

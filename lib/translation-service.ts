import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// 獲取指定類別的翻譯
export async function getTranslationsByCategory(category: string) {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase.from("translations").select("*").eq("category", category)

    if (error) {
      console.error("Error fetching translations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching translations:", error)
    return []
  }
}

// 翻譯單個詞彙
export async function translateTerm(term: string, category = "general") {
  const supabase = createClientComponentClient()

  try {
    const { data, error } = await supabase
      .from("translations")
      .select("english")
      .eq("chinese", term)
      .eq("category", category)
      .maybeSingle()

    if (error) {
      console.error("Error translating term:", error)
      return term
    }

    return data?.english || term
  } catch (error) {
    console.error("Error translating term:", error)
    return term
  }
}

// 格式化製程資料用於訂單備註
export async function formatProcessesForOrderRemarks(processes: string[], translate = false) {
  if (!processes || processes.length === 0) {
    return ""
  }

  let result = "製程要求:\n"

  if (translate) {
    result = "Process Requirements:\n"

    for (const process of processes) {
      const [processName, requirements] = process.split(":").map((p) => p.trim())

      // 翻譯製程名稱
      const translatedName = await translateTerm(processName, "process")

      // 翻譯要求（如果有）
      let translatedRequirements = requirements
      if (requirements) {
        // 嘗試翻譯整個要求
        const fullTranslation = await translateTerm(requirements, "process_requirements")

        // 如果沒有找到整個要求的翻譯，嘗試逐詞翻譯
        if (fullTranslation === requirements) {
          const words = requirements.split(/[,，、]/).map((w) => w.trim())
          const translatedWords = await Promise.all(
            words.map(async (word) => await translateTerm(word, "process_terms")),
          )
          translatedRequirements = translatedWords.join(", ")
        } else {
          translatedRequirements = fullTranslation
        }
      }

      result += `- ${translatedName}: ${translatedRequirements || ""}\n`
    }
  } else {
    for (const process of processes) {
      result += `- ${process}\n`
    }
  }

  return result
}

// 翻譯製程資料
export async function translateProcessData(processData: any[]) {
  if (!processData || processData.length === 0) {
    return []
  }

  const translatedData = []

  for (const process of processData) {
    const translatedProcess = { ...process }

    // 翻譯製程名稱
    if (process.process) {
      translatedProcess.process = await translateTerm(process.process, "process")
    }

    // 翻譯要求
    if (process.requirements) {
      translatedProcess.requirements = await translateTerm(process.requirements, "process_requirements")
    }

    // 翻譯報告
    if (process.report) {
      translatedProcess.report = await translateTerm(process.report, "process_terms")
    }

    translatedData.push(translatedProcess)
  }

  return translatedData
}

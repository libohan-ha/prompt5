'use client'

import { LoadingDialog } from "@/components/loading-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { callDeepseek, callGemini, callGeminiFlash } from "@/lib/api"
import { getLocalStorage, setLocalStorage } from '@/lib/utils'
import { ArrowRight, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [prompt, setPrompt] = useState("")
  const [model, setModel] = useState("deepseek-v3")
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast({
        title: "错误",
        description: "请输入需要优化的prompt",
        variant: "destructive"
      })
      return
    }

    if (model !== "deepseek-v3") {
      const apiKey = getLocalStorage("gemini-key")
      if (!apiKey) {
        toast({
          title: "错误",
          description: "请先设置 Gemini API Key",
          variant: "destructive"
        })
        return
      }
    }

    try {
      setIsOptimizing(true)
      
      // 调用AI优化prompt
      const systemPrompt = `你是一个专业的AI提示词优化专家。请帮我优化以下prompt，并按照以下格式返回：

# Role: [角色名称]

## Profile
- language: [语言]
- description: [详细的角色描述]
- background: [角色背景]
- personality: [性格特征]
- expertise: [专业领域]
- target_audience: [目标用户群]

## Skills

1. [核心技能类别 1]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]

2. [核心技能类别 2]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]

3. [辅助技能类别]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]
   - [具体技能]: [简要说明]

## Rules

1. [基本原则]：
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]

2. [行为准则]：
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]
   - [具体规则]: [详细说明]

3. [限制条件]：
   - [具体限制]: [详细说明]
   - [具体限制]: [详细说明]
   - [具体限制]: [详细说明]
   - [具体限制]: [详细说明]

## Workflows

1. [主要工作流程 1]
   - 目标: [明确目标]
   - 步骤 1: [详细说明]
   - 步骤 2: [详细说明]
   - 步骤 3: [详细说明]
   - 预期结果: [说明]

2. [主要工作流程 2]
   - 目标: [明确目标]
   - 步骤 1: [详细说明]
   - 步骤 2: [详细说明]
   - 步骤 3: [详细说明]
   - 预期结果: [说明]

请基于以上模板，优化并扩展以下prompt，确保内容专业、完整且结构清晰：

${prompt}`

      let result
      switch (model) {
        case "deepseek-v3":
          result = await callDeepseek(systemPrompt, "")
          break
        case "gemini-2.0-flash-exp":
          result = await callGeminiFlash(systemPrompt, "")
          break
        default:
          result = await callGemini(systemPrompt, "")
      }

      // 使用安全的 localStorage 函数
      setLocalStorage('optimizedPrompt', JSON.stringify({
        content: result,
        originalPrompt: prompt,
        version: 1
      }))

      // 跳转到优化页面
      router.push('/optimize')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '发生未知错误'
      
      toast({
        title: "优化失败",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl space-y-8 sm:space-y-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent text-center">
            Prompt Optimizer
          </h1>
          
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl space-y-6">
            <Input 
              placeholder="简单描述你的需求或粘贴prompt" 
              className="h-12 sm:h-16 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 border-blue-100 focus:ring-2 focus:ring-blue-400 focus:border-transparent px-4 sm:px-6"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <Button 
              className="w-full h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 hover:opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105 text-white"
              onClick={handleOptimize}
            >
              <span>一键优化</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
            </Button>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
              <Select defaultValue="deepseek-v3" onValueChange={setModel}>
                <SelectTrigger className="w-[200px] h-12 sm:h-16 text-base sm:text-lg bg-white border-orange-200 text-orange-600 rounded-xl sm:rounded-2xl">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek-v3">DeepSeek V3</SelectItem>
                  <SelectItem value="gemini-1206">Gemini 1206</SelectItem>
                  <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                </SelectContent>
              </Select>
              <SettingsDialog />
            </div>
          </div>
        </div>
      </div>
      <LoadingDialog open={isOptimizing} />
    </main>
  )
} 
'use client'

import { IterateDialog } from "@/components/iterate-dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { callDeepseek, callGemini, callGeminiFlash } from "@/lib/api"
import { getLocalStorage, setLocalStorage } from '@/lib/utils'
import type { OptimizedPrompt, TestResult } from '@/types/prompt'
import { ArrowRightIcon, Check, CopyIcon, Loader2, Play, Sparkles, Zap, PlusCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OptimizePage() {
  const router = useRouter()
  const [promptHistory, setPromptHistory] = useState<OptimizedPrompt[]>([])
  
  useEffect(() => {
    const saved = getLocalStorage('optimizedPrompt')
    if (saved) {
      try {
        setPromptHistory([JSON.parse(saved)])
      } catch (error) {
        console.error('Error parsing saved prompt:', error)
      }
    }
  }, [])
  
  const [currentVersion, setCurrentVersion] = useState(1)
  
  const prompt = promptHistory[currentVersion - 1] || {
    content: "",
    originalPrompt: "",
    version: 1
  }

  const [testInput, setTestInput] = useState("")
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isIterating, setIsIterating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState("deepseek-v3")
  const [isIterateDialogOpen, setIsIterateDialogOpen] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isOptimizing, setIsOptimizing] = useState(false)

  const saveHistory = (history: OptimizedPrompt[]) => {
    setPromptHistory(history)
    setLocalStorage('optimizedPromptHistory', JSON.stringify(history))
  }

  const handleTest = async () => {
    try {
      setIsLoading(true)
      
      let result
      switch (model) {
        case "deepseek-v3":
          result = await callDeepseek(prompt.content, testInput)
          break
        case "gemini-2.0-flash-exp":
          result = await callGeminiFlash(prompt.content, testInput)
          break
        case "gemini-1206":
          result = await callGemini(prompt.content, testInput)
          break
        default:
          throw new Error("未知的模型类型")
      }
      
      setTestResult({
        input: testInput,
        output: result,
        model: model
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '发生未知错误'
      
      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleIterate = async (feedback: string) => {
    try {
      setIsIterating(true)
      
      const systemPrompt = `你是一个专业的AI提示词优化专家。请根据以下反馈优化prompt：

当前prompt:
${prompt.content}

用户反馈：
${feedback}

请基于用户的反馈，生成一个改进后的prompt，保持相同的格式结构，但针对性地解决用户提出的问题。`

      let result
      switch (model) {
        case "deepseek-v3":
          result = await callDeepseek(systemPrompt, "")
          break
        case "gemini-2.0-flash-exp":
          result = await callGeminiFlash(systemPrompt, "")
          break
        case "gemini-1206":
          result = await callGemini(systemPrompt, "")
          break
        default:
          throw new Error("未知的模型类型")
      }

      const newVersion = {
        content: result,
        originalPrompt: prompt.originalPrompt,
        version: promptHistory.length + 1
      }

      const newHistory = [...promptHistory, newVersion]
      saveHistory(newHistory)
      setCurrentVersion(newVersion.version)
      setIsIterateDialogOpen(false)

      toast({
        title: "迭代成功",
        description: `已生成第 ${newVersion.version} 个版本`
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : '发生未知错误'
      
      toast({
        title: "迭代失败",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsIterating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }

      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand('copy')
        textArea.remove()
        return true
      } catch (error) {
        textArea.remove()
        return false
      }
    } catch (error) {
      return false
    }
  }

  const handleOptimize = async () => {
    setIsOptimizing(true)
    try {
      const optimizedPrompt = await callDeepseek(
        "你是一个提示词优化专家。你需要帮助用户优化他们的提示词，使其更加清晰、具体和有效。",
        `请帮我优化以下提示词，使其更加清晰和有效：\n\n${prompt.content}`
      )
      
      setPromptHistory([
        {
          content: optimizedPrompt,
          originalPrompt: prompt.content,
          version: promptHistory.length + 1
        },
        ...promptHistory
      ])
      
      localStorage.setItem('optimizedPrompt', JSON.stringify({
        content: optimizedPrompt,
        originalPrompt: prompt.content,
        version: promptHistory.length + 1
      }))
      
      toast({
        title: "优化成功",
        description: "提示词已经过优化"
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "优化失败",
        description: error instanceof Error ? error.message : "未知错误"
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleNewProject = () => {
    localStorage.removeItem('optimizedPrompt')
    localStorage.removeItem('optimizedPromptHistory')
    router.push('/')
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white/90 rounded-2xl sm:rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-lg">
          <div className="p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Prompt Optimizer
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Optimized Prompt */}
              <div className="flex flex-col h-full">
                <div className="flex-1 bg-blue-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-semibold text-blue-800">优化后Prompt</h2>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {promptHistory.map((_, index) => {
                        const num = index + 1
                        return (
                          <button
                            key={num}
                            onClick={() => {
                              setCurrentVersion(num)
                            }}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center text-base sm:text-lg
                              ${currentVersion === num
                                ? 'bg-blue-500 text-white border-blue-600' 
                                : 'bg-white text-blue-500 border-blue-300 hover:bg-blue-50'
                              }`}
                          >
                            {num}
                          </button>
                        )
                      })}
                      <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 ml-1 sm:ml-2" />
                    </div>
                  </div>
                  <Textarea
                    className="h-[450px] resize-none bg-white border-2 border-blue-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base sm:text-lg p-4 font-mono"
                    value={editedContent || prompt.content}
                    onChange={(e) => setEditedContent(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-white hover:bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-400 flex items-center justify-center space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={async () => {
                      if (editedContent && editedContent !== prompt.content) {
                        const newHistory = [...promptHistory]
                        newHistory[currentVersion - 1] = {
                          ...prompt,
                          content: editedContent
                        }
                        setPromptHistory(newHistory)
                        localStorage.setItem('optimizedPromptHistory', JSON.stringify(newHistory))
                        setEditedContent("")
                        
                        toast({
                          title: "保存成功",
                          description: "已保存修改的内容"
                        })
                      } else {
                        const success = await copyToClipboard(prompt.content)
                        if (success) {
                          toast({
                            title: "复制成功",
                            description: "提示词已复制到剪贴板"
                          })
                        } else {
                          toast({
                            title: "复制失败",
                            description: "请手动复制文本",
                            variant: "destructive"
                          })
                        }
                      }
                    }}
                  >
                    {editedContent && editedContent !== prompt.content ? (
                      <>
                        <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>保存</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>复制</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-400 flex items-center justify-center space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={() => setIsIterateDialogOpen(true)}
                    disabled={isIterating || Boolean(editedContent && editedContent !== prompt.content)}
                  >
                    {isIterating ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span>处理中...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>迭代</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Content to Process */}
              <div className="flex flex-col h-full">
                <div className="flex-1 bg-green-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg border border-green-100">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-green-800">待处理内容</h2>
                    <p className="text-sm text-green-600">
                      在这里输入需要处理的实际内容（如：需要翻译的文章、需要检查的代码等），
                      点击下方"测试"按钮验证优化后的prompt效果。
                    </p>
                  </div>
                  <Textarea 
                    className="h-[450px] resize-none bg-white border-2 border-green-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-transparent text-base sm:text-lg p-4"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="输入实际内容进行测试，例如：
- 如果是翻译prompt，在这里输入要翻译的文章
- 如果是代码检查prompt，在这里输入要检查的代码
- 如果是文章总结prompt，在这里输入要总结的文章
..."
                  />
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-white hover:bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-400 flex items-center justify-center space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={handleTest}
                    disabled={isLoading || !testInput.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
                        <span>处理中...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>测试效果</span>
                      </>
                    )}
                  </Button>
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
                </div>
              </div>

              {/* Output Preview */}
              <div className="flex flex-col h-full">
                <div className="flex-1 bg-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-4 shadow-lg border border-purple-100">
                  <h2 className="text-xl sm:text-2xl font-semibold text-purple-800 mb-4 sm:mb-6">输出预览</h2>
                  <Textarea 
                    className="h-[450px] resize-none bg-white border-2 border-purple-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-base sm:text-lg p-4"
                    value={testResult?.output ?? ''}
                    readOnly
                    placeholder="测试结果将在这里显示..."
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-white hover:bg-green-50 text-green-600 border-green-200 hover:border-green-400 flex items-center justify-center space-x-3 transition-all duration-300 ease-in-out transform hover:scale-105"
                    onClick={handleNewProject}
                  >
                    <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span>新建项目</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <IterateDialog
        open={isIterateDialogOpen}
        onOpenChange={setIsIterateDialogOpen}
        onConfirm={handleIterate}
        isLoading={isIterating}
      />
    </>
  )
} 
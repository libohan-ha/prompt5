'use client'

import { LoadingDialog } from "@/components/loading-dialog"
import { SettingsDialog } from "@/components/settings-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { setLocalStorage } from '@/lib/utils'
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

    // 直接保存原始prompt并跳转
    setLocalStorage('optimizedPrompt', JSON.stringify({
      content: "",  // 内容留空,等待优化
      originalPrompt: prompt,
      version: 1
    }))

    // 立即跳转到优化页面
    router.push('/optimize')
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
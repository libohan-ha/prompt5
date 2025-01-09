'use client'

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { setLocalStorage } from "@/lib/utils"
import { useRouter } from "next/navigation"
import React from 'react'

export default function Home() {
  const router = useRouter()
  const [prompt, setPrompt] = React.useState("")

  const handleOptimize = () => {
    if (!prompt.trim()) {
      toast({
        title: "请输入Prompt",
        description: "Prompt不能为空",
        variant: "destructive"
      })
      return
    }

    setLocalStorage('optimizedPrompt', JSON.stringify({
      originalPrompt: prompt
    }))
    
    router.push('/optimize')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white/90 rounded-2xl sm:rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-lg">
        <div className="p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Prompt Optimizer
          </h1>
          
          <div className="space-y-4">
            <Textarea
              className="h-[300px] resize-none bg-white border-2 border-blue-100 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base sm:text-lg p-4"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="请输入需要优化的prompt..."
            />
            
            <div className="flex justify-end">
              <Button
                className="h-12 sm:h-16 px-6 sm:px-8 text-base sm:text-lg rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleOptimize}
              >
                <span className="mr-2">开始优化</span><span>→</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 
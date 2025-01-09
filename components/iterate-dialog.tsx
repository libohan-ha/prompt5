import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface IterateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (feedback: string) => Promise<void>
  isLoading: boolean
}

export function IterateDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: IterateDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const feedback = formData.get('feedback') as string
    onConfirm(feedback)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>改进提示词</DialogTitle>
          <DialogDescription>
            请描述当前输出结果的不足之处，以及您期望的效果。AI将根据您的反馈优化提示词。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            name="feedback"
            placeholder="例如：
- 翻译结果不够通顺，希望更符合目标语言的表达习惯
- 代码分析不够深入，希望能指出更多潜在问题
- 总结内容不够精炼，希望能突出重点..."
            className="h-[200px]"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '确认'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
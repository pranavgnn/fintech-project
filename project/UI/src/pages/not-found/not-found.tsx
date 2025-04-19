import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <FileQuestion className="h-24 w-24 text-muted-foreground" />
      <h1 className="mt-6 text-3xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-center text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex gap-4">
        <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  )
}

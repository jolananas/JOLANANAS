import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium">
      <Card className="max-w-md mx-auto border-0 shadow-lg">
        <CardHeader className="text-center">
          <Badge variant="destructive" className="text-6xl font-bold mb-4 w-fit mx-auto px-8 py-4">
            404
          </Badge>
          <CardTitle className="text-3xl font-semibold text-jolananas-black-ink mb-4">
            Collection non trouvée
          </CardTitle>
          <CardDescription className="text-lg mb-8">
            Désolé, cette collection n'existe pas dans notre catalogue ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <Button asChild className="w-full">
            <Link href="/">
              Retour à l'accueil
            </Link>
          </Button>
          
          <Button variant="link" asChild>
            <Link href="/collections">
              Voir toutes nos collections
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
import { Heart, Sparkles, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Separator } from "@/components/ui/Separator"

export default function AboutPage() {
  return (
    <>
      <main className="container py-12 md:py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Hero avec Card */}
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl text-balance">
                À propos de JOLANANAS
              </CardTitle>
              <CardDescription className="text-lg text-pretty leading-relaxed">
                Des créations artisanales girly et utiles, faites main avec passion
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Story avec Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl font-bold">Notre histoire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed">
                JOLANANAS est née d'une passion pour les créations artisanales et le style girly. Chaque accessoire est
                conçu et fabriqué à la main avec amour et attention aux détails.
              </CardDescription>
              <Separator />
              <CardDescription className="text-base leading-relaxed">
                Notre mission est de créer des pièces uniques qui allient esthétique et utilité, pour sublimer votre
                quotidien avec des accessoires qui vous ressemblent.
              </CardDescription>
            </CardContent>
          </Card>

          {/* Values avec Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader className="text-center">
                <Badge className="mx-auto h-12 w-12 p-0 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6" />
                </Badge>
                <CardTitle className="font-serif font-semibold">Fait main</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-center">
                  Chaque création est unique et fabriquée avec soin
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Badge className="mx-auto h-12 w-12 p-0 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6" />
                </Badge>
                <CardTitle className="font-serif font-semibold">Style girly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-center">
                  Des designs féminins et élégants qui vous ressemblent
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <Badge className="mx-auto h-12 w-12 p-0 flex items-center justify-center mb-3">
                  <Package className="h-6 w-6" />
                </Badge>
                <CardTitle className="font-serif font-semibold">Qualité</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed text-center">
                  Des matériaux soigneusement sélectionnés pour durer
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}


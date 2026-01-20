import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { GraduationCap, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      setIsSubmitted(true);
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-orange-500 p-3 rounded-lg">
              <GraduationCap className="h-8 w-8 text-black" />
            </div>
            <span className="text-white text-2xl">منصة التعليم</span>
          </Link>
        </div>

        <Card className="border-orange-500/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">استعادة كلمة المرور</CardTitle>
            <CardDescription className="text-center">
              {isSubmitted 
                ? 'تحقق من بريدك الإلكتروني'
                : 'أدخل بريدك الإلكتروني لاستعادة كلمة المرور'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black"
                >
                  إرسال رابط الإعادة
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    تم إرسال رابط إعادة تعيين كلمة المرور إلى:
                  </p>
                  <p className="text-green-900 mt-2">{email}</p>
                </div>
                <p className="text-sm text-gray-600">
                  يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.
                </p>
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
                >
                  إرسال مرة أخرى
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-gray-600">
              تذكرت كلمة المرور؟{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-600 transition-colors">
                تسجيل الدخول
              </Link>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors mx-auto">
              <ArrowRight className="h-4 w-4" />
              العودة للصفحة الرئيسية
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Login = () => {
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success('Acesso autorizado!');
      navigate('/admin');
    } else {
      toast.error('Senha incorreta. Tente novamente.');
      setPassword(''); // Limpa o campo em caso de erro
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center font-display text-2xl text-primary">
            Área Administrativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Senha de Acesso</label>
              <Input
                type="password"
                placeholder="Insira a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
              />
            </div>
            <div className="flex justify-center">
                <Button 
                type="submit" 
                className="w-full max-w-[150px] gradient-primary text-white"
                 >
                    Entrar
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
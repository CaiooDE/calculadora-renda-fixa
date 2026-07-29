# RendaFixa — Calculadora de investimentos

Calculadora responsiva para projetar investimentos em renda fixa com juros
compostos, aportes mensais ou anuais e reajustes recorrentes.

## Recursos

- projeção mês a mês com taxa mensal;
- aporte inicial e recorrente, mensal ou anual;
- reajuste dos aportes por percentual ou valor fixo;
- gráfico comparando patrimônio e total aportado;
- renda mensal e anual estimadas sem consumir o principal;
- estimativa opcional de IR regressivo por lote de aporte;
- valor final corrigido pela inflação estimada;
- interface escura, responsiva e acessível.

## Rodar localmente

```bash
npm install
npm run dev
```

## Validar

```bash
npm test
npm run build
```

## Premissas

Os juros são creditados mensalmente e os aportes acontecem no fim de cada
período. A taxa é constante. A simulação não inclui IOF, carência, taxas de
corretagem, custódia ou administração.

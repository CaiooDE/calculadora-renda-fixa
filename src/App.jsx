import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ChevronDown,
  CircleDollarSign,
  Landmark,
  LineChart,
  PiggyBank,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import ProjectionChart from "./components/ProjectionChart";
import { Field, Segmented, Toggle } from "./components/FormControls";
import { buildProjection, DEFAULT_INPUTS } from "./lib/investment";
import { formatCurrency, formatDuration, formatNumber } from "./lib/format";

const frequencyOptions = [
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

const timeOptions = [
  { value: "months", label: "Meses" },
  { value: "years", label: "Anos" },
];

function CurrencyInput({ value, onChange, ariaLabel }) {
  return (
    <div className="money-input">
      <span>R$</span>
      <input
        type="number"
        min="0"
        step="100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
      />
    </div>
  );
}

function ResultCard({ icon: Icon, label, value, helper, accent = false }) {
  return (
    <article className={`result-card ${accent ? "accent-card" : ""}`}>
      <div className="result-icon">
        <Icon size={18} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      {helper && <small>{helper}</small>}
    </article>
  );
}

function Metric({ label, value, tone }) {
  return (
    <div className="metric-row">
      <span>{label}</span>
      <strong className={tone ?? ""}>{value}</strong>
    </div>
  );
}

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const projection = useMemo(() => buildProjection(inputs), [inputs]);

  const update = (key, value) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const reset = () => setInputs(DEFAULT_INPUTS);

  const contributionLabel =
    inputs.contributionFrequency === "monthly" ? "Aporte mensal" : "Aporte anual";
  const increasePeriodLabel =
    inputs.increaseFrequency === "years"
      ? Number(inputs.increaseEvery) === 1
        ? "ano"
        : "anos"
      : Number(inputs.increaseEvery) === 1
        ? "mês"
        : "meses";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="RendaFixa, início">
          <span className="brand-mark">
            <Landmark size={19} />
          </span>
          <span>Renda<strong>Fixa</strong></span>
        </a>
        <div className="header-note">
          <ShieldCheck size={15} />
          Simulação clara, sem cadastro
        </div>
      </header>

      <main id="top">
        <section className="intro">
          <div>
            <div className="eyebrow">
              <Sparkles size={14} />
              PLANEJAMENTO FINANCEIRO
            </div>
            <h1>Veja seu dinheiro trabalhar <span>por você.</span></h1>
            <p>
              Simule aportes, reajustes e juros compostos para descobrir onde seu
              investimento pode chegar.
            </p>
          </div>
          <button className="reset-button" type="button" onClick={reset}>
            <RefreshCcw size={15} />
            Restaurar exemplo
          </button>
        </section>

        <section className="workspace">
          <aside className="simulator-panel">
            <div className="panel-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Dados da simulação</h2>
                <p>Ajuste os valores para o seu cenário.</p>
              </div>
            </div>

            <div className="form-grid">
              <Field
                label="Valor inicial"
                hint="Quanto você já possui para começar o investimento."
              >
                <CurrencyInput
                  value={inputs.initialAmount}
                  onChange={(value) => update("initialAmount", value)}
                  ariaLabel="Valor inicial"
                />
              </Field>

              <Field
                label={contributionLabel}
                hint="O aporte é aplicado ao final de cada período selecionado."
              >
                <CurrencyInput
                  value={inputs.contribution}
                  onChange={(value) => update("contribution", value)}
                  ariaLabel={contributionLabel}
                />
                <Segmented
                  value={inputs.contributionFrequency}
                  onChange={(value) => update("contributionFrequency", value)}
                  options={frequencyOptions}
                  ariaLabel="Frequência do aporte"
                />
              </Field>

              <div className="form-row two-columns">
                <Field
                  label="Rentabilidade ao mês"
                  hint="Taxa bruta constante creditada mensalmente. Ex.: 0,85% ao mês."
                  suffix="% a.m."
                >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={inputs.monthlyRatePercent}
                    onChange={(event) => update("monthlyRatePercent", event.target.value)}
                    aria-label="Rentabilidade ao mês"
                  />
                </Field>

                <Field label="Tempo investindo">
                  <input
                    type="number"
                    min="1"
                    max={inputs.durationUnit === "years" ? 100 : 1200}
                    step="1"
                    value={inputs.duration}
                    onChange={(event) => update("duration", event.target.value)}
                    aria-label="Tempo investindo"
                  />
                  <Segmented
                    value={inputs.durationUnit}
                    onChange={(value) => update("durationUnit", value)}
                    options={timeOptions}
                    ariaLabel="Unidade do tempo investindo"
                  />
                </Field>
              </div>

              <div className="divider" />

              <Toggle
                checked={inputs.hasIncrease}
                onChange={(value) => update("hasIncrease", value)}
                label="Aumentar o valor dos aportes"
                description="Programe um reajuste recorrente para acompanhar sua renda."
              />

              {inputs.hasIncrease && (
                <div className="increase-box">
                  <Field
                    label="Valor do aumento"
                    suffix={inputs.increaseType === "percent" ? "%" : undefined}
                  >
                    {inputs.increaseType === "fixed" ? (
                      <CurrencyInput
                        value={inputs.increaseValue}
                        onChange={(value) => update("increaseValue", value)}
                        ariaLabel="Valor fixo do aumento"
                      />
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={inputs.increaseValue}
                        onChange={(event) => update("increaseValue", event.target.value)}
                        aria-label="Percentual do aumento"
                      />
                    )}
                    <Segmented
                      value={inputs.increaseType}
                      onChange={(value) => update("increaseType", value)}
                      options={[
                        { value: "percent", label: "Percentual" },
                        { value: "fixed", label: "Valor fixo" },
                      ]}
                      ariaLabel="Tipo de aumento"
                    />
                  </Field>

                  <Field
                    label="A cada"
                    hint="O reajuste é aplicado antes do primeiro aporte do novo período."
                  >
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={inputs.increaseEvery}
                      onChange={(event) => update("increaseEvery", event.target.value)}
                      aria-label="Intervalo do aumento"
                    />
                    <Segmented
                      value={inputs.increaseFrequency}
                      onChange={(value) => update("increaseFrequency", value)}
                      options={timeOptions}
                      ariaLabel="Unidade do intervalo de aumento"
                    />
                  </Field>

                  <p className="increase-summary">
                    Seu aporte será reajustado em{" "}
                    <strong>
                      {inputs.increaseType === "percent"
                        ? `${formatNumber(Number(inputs.increaseValue))}%`
                        : formatCurrency(Number(inputs.increaseValue))}
                    </strong>{" "}
                    a cada <strong>{inputs.increaseEvery} {increasePeriodLabel}</strong>.
                  </p>
                </div>
              )}

              <button
                type="button"
                className={`advanced-trigger ${showAdvanced ? "open" : ""}`}
                onClick={() => setShowAdvanced((current) => !current)}
                aria-expanded={showAdvanced}
              >
                Premissas avançadas
                <ChevronDown size={17} />
              </button>

              {showAdvanced && (
                <div className="advanced-box">
                  <Toggle
                    checked={inputs.includeTax}
                    onChange={(value) => update("includeTax", value)}
                    label="Estimar IR regressivo"
                    description="Calcula o imposto de cada aporte conforme seu tempo aplicado."
                  />
                  <Field
                    label="Inflação anual estimada"
                    hint="Usada somente para mostrar o poder de compra equivalente no final."
                    suffix="% a.a."
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={inputs.annualInflationPercent}
                      onChange={(event) =>
                        update("annualInflationPercent", event.target.value)
                      }
                      aria-label="Inflação anual estimada"
                    />
                  </Field>
                </div>
              )}
            </div>
          </aside>

          <div className="results-area">
            <div className="results-heading">
              <div>
                <span className="step-number">02</span>
                <div>
                  <h2>Sua projeção</h2>
                  <p>Resultado ao fim de {formatDuration(projection.durationMonths)}.</p>
                </div>
              </div>
              <span className="live-badge"><i /> Atualização instantânea</span>
            </div>

            <div className="cards-grid">
              <ResultCard
                icon={PiggyBank}
                label="Patrimônio final bruto"
                value={formatCurrency(projection.balance)}
                helper={`${formatNumber(projection.returnMultiple)}× o total aplicado`}
                accent
              />
              <ResultCard
                icon={CircleDollarSign}
                label="Renda mensal estimada"
                value={formatCurrency(projection.monthlyIncome)}
                helper="Mantendo o principal investido"
              />
              <ResultCard
                icon={WalletCards}
                label="Total aportado"
                value={formatCurrency(projection.invested)}
                helper={`Aporte final: ${formatCurrency(projection.finalContribution)}`}
              />
              <ResultCard
                icon={ArrowUpRight}
                label="Juros acumulados"
                value={formatCurrency(projection.totalInterest)}
                helper={`${formatNumber(
                  projection.balance
                    ? (projection.totalInterest / projection.balance) * 100
                    : 0,
                )}% do patrimônio`}
              />
            </div>

            <section className="chart-card">
              <div className="chart-heading">
                <div>
                  <div className="section-icon"><LineChart size={18} /></div>
                  <div>
                    <h3>Evolução do patrimônio</h3>
                    <p>O efeito dos juros compostos ao longo do tempo.</p>
                  </div>
                </div>
                <div className="legend">
                  <span><i className="balance-line" /> Patrimônio</span>
                  <span><i className="invested-line" /> Aportes</span>
                </div>
              </div>
              <ProjectionChart data={projection.chartData} />
            </section>

            <div className="details-grid">
              <section className="detail-card">
                <div className="detail-heading">
                  <div className="section-icon"><BarChart3 size={18} /></div>
                  <div>
                    <h3>Resumo financeiro</h3>
                    <p>Valores projetados para o fim do período.</p>
                  </div>
                </div>
                <div className="metrics">
                  <Metric label="Renda anual bruta" value={formatCurrency(projection.annualIncome)} />
                  <Metric
                    label="IR estimado no resgate"
                    value={inputs.includeTax ? `− ${formatCurrency(projection.estimatedTax)}` : "Desativado"}
                    tone={inputs.includeTax ? "negative" : ""}
                  />
                  <Metric
                    label="Saldo líquido estimado"
                    value={formatCurrency(projection.netBalance)}
                    tone="positive"
                  />
                  <Metric
                    label="Poder de compra atual"
                    value={formatCurrency(projection.realBalance)}
                  />
                </div>
              </section>

              <section className="detail-card assumptions-card">
                <div className="detail-heading">
                  <div className="section-icon"><CalendarRange size={18} /></div>
                  <div>
                    <h3>Como calculamos</h3>
                    <p>Premissas usadas nesta projeção.</p>
                  </div>
                </div>
                <ul>
                  <li>Juros creditados mensalmente sobre todo o saldo.</li>
                  <li>Aportes realizados no fim de cada período.</li>
                  <li>Reajuste aplicado antes do aporte do novo ciclo.</li>
                  <li>Taxa constante, sem taxas de corretagem ou administração.</li>
                </ul>
              </section>
            </div>

            <div className="disclaimer">
              <ShieldCheck size={17} />
              <p>
                <strong>Simulação educacional.</strong> A projeção é exata para os valores e
                premissas informados, mas não garante rentabilidade futura. IR e inflação são
                estimativas; IOF, carência, taxas e regras específicas do produto não estão incluídos.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span><Landmark size={15} /> RendaFixa</span>
        <p>Planeje hoje. Decida com clareza.</p>
      </footer>
    </div>
  );
}

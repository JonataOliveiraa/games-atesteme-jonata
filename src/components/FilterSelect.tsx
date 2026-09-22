export type FilterOption = {
  value: string;
  label: string;
  /** Quantos jogos este valor traz, já contando o outro filtro ativo. */
  count: number;
};

type Props = {
  legend: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

/**
 * Um botão que abre a lista de valores de um filtro.
 *
 * Por dentro é um `<select>` de verdade, com a aparência trocada. Escrever a
 * lista à mão com divs custaria de novo tudo o que o nativo já dá de graça:
 * a roda de seleção do celular, o teclado (setas, digitar a primeira letra,
 * Esc), o leitor de tela e o fechar ao clicar fora.
 *
 * A contagem vai no texto da opção, e não num selo ao lado: `<option>` aceita
 * texto e nada mais — qualquer elemento ali dentro é ignorado pelo navegador.
 */
export default function FilterSelect({
  legend,
  value,
  options,
  onChange,
}: Props) {
  return (
    <label className="filter-select">
      <span className="filter-select-legend">{legend}</span>

      <span className="filter-select-control">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option.value || "todos"} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </select>
      </span>
    </label>
  );
}

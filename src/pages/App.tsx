import { useEffect, useState } from "react";
import axios from "axios";

type Material = {
  id: number;
  codigoItem: string;
  descricao: string;
  unidade: string;
  estoqueInicial: number;
  estoqueAtual: number;
  codigoEstoque?: string | null;
  descricaoEstoque?: string | null;
  confirmado?: number | null;
  pedido?: number | null;
  disponivel?: number | null;
  precoItem?: number | null;
  total?: number | null;
  codigoProjeto?: string | null;
  descricaoProjeto?: string | null;
  centroCustos?: string | null;
};

type MedicaoGrid = {
  id: number;
  dia: string | null;
  semana: string | null;
  cliente: string | null;
  projeto: string;
  escala: string | null;
  tecnicoLider: string | null;
  quantidadeTecnicos: number | null;
  nomesTecnicos: string | null;
  tipoHora: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  codigoItem: string; // virá de material
  descricaoMaterial: string;
  unidadeMaterial: string;
  quantidadeConsumida: number;
  torre: string | null;
  criadoEm: string; // m.data
};

// Backend principal do portal roda na porta 4001 (para não conflitar com o servidor de passagens).
// Usa variável de ambiente se disponível, senão usa localhost
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:4001";

export function App() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [buscaEstoque, setBuscaEstoque] = useState("");
  const [filtroProjeto, setFiltroProjeto] = useState("");

  // Edição/remoção de material (tela de estoque)
  const [materialEditando, setMaterialEditando] = useState<Material | null>(null);
  const [editDescricao, setEditDescricao] = useState("");
  const [editUnidade, setEditUnidade] = useState("");
  const [editEstoqueInicial, setEditEstoqueInicial] = useState("0");
  const [editEstoqueAtual, setEditEstoqueAtual] = useState("0");
  const [editandoSalvando, setEditandoSalvando] = useState(false);

  const [codigoItem, setCodigoItem] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("KG");
  const [estoqueInicial, setEstoqueInicial] = useState("0");

  // Formulário simples para testar medição
  const [codigoItemMedicao, setCodigoItemMedicao] = useState("");
  const [quantidadeMedida, setQuantidadeMedida] = useState("0");
  const [projetoMedicao, setProjetoMedicao] = useState("");
  const [torreMedicao, setTorreMedicao] = useState("");

  // Importação em massa (cola do Excel)
  const [textoImportacao, setTextoImportacao] = useState("");
  const [mensagemImportacao, setMensagemImportacao] = useState<string | null>(
    null,
  );
  const [arquivoExcel, setArquivoExcel] = useState<File | null>(null);

  // Formulário completo (parecido com Smartsheet)
  const [dia, setDia] = useState("");
  const [semana, setSemana] = useState("");
  const [cliente, setCliente] = useState("");
  const [escala, setEscala] = useState("");
  const [qtdTecnicos, setQtdTecnicos] = useState("");
  const [tecnicoLider, setTecnicoLider] = useState("");
  const [nomesTecnicos, setNomesTecnicos] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [tipoIntervalo, setTipoIntervalo] = useState("");
  const [tipoAcesso, setTipoAcesso] = useState("");
  const [pa, setPa] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [equipe, setEquipe] = useState("");
  const [tipoHora, setTipoHora] = useState("");
  const [qtdEventos, setQtdEventos] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [hora2Inicio, setHora2Inicio] = useState("");
  const [hora2Fim, setHora2Fim] = useState("");
  const [hora3Inicio, setHora3Inicio] = useState("");
  const [hora3Fim, setHora3Fim] = useState("");

  // Dano e materiais
  const [tipoDano, setTipoDano] = useState("");
  const [danoCodigo, setDanoCodigo] = useState("");
  const [larguraDano, setLarguraDano] = useState("");
  const [comprimentoDano, setComprimentoDano] = useState("");
  const [etapaProcesso, setEtapaProcesso] = useState("");
  const [etapaLixamento, setEtapaLixamento] = useState("");

  const [resinaTipo, setResinaTipo] = useState("");
  const [resinaQuantidade, setResinaQuantidade] = useState("");
  const [resinaCatalisador, setResinaCatalisador] = useState("");
  const [resinaLote, setResinaLote] = useState("");
  const [resinaValidade, setResinaValidade] = useState("");

  const [massaTipo, setMassaTipo] = useState("");
  const [massaQuantidade, setMassaQuantidade] = useState("");
  const [massaCatalisador, setMassaCatalisador] = useState("");
  const [massaLote, setMassaLote] = useState("");
  const [massaValidade, setMassaValidade] = useState("");

  const [nucleoTipo, setNucleoTipo] = useState("");
  const [nucleoTipoNucleo, setNucleoTipoNucleo] = useState(""); // Tipo do núcleo: Rígida ou Flexível
  const [nucleoEspessura, setNucleoEspessura] = useState("");

  const [puTipo, setPuTipo] = useState("");
  const [puMassaPeso, setPuMassaPeso] = useState("");
  const [puCatalisadorPeso, setPuCatalisadorPeso] = useState("");
  const [puLote, setPuLote] = useState("");
  const [puValidade, setPuValidade] = useState("");

  const [gelTipo, setGelTipo] = useState("");
  const [gelPeso, setGelPeso] = useState("");
  const [gelCatalisadorPeso, setGelCatalisadorPeso] = useState("");
  const [gelLote, setGelLote] = useState("");
  const [gelValidade, setGelValidade] = useState("");

  const [retrabalho, setRetrabalho] = useState<"Sim" | "Não" | "">("");
  const [mostrarSomenteNoEstoque, setMostrarSomenteNoEstoque] = useState(true);

  const [medicoes, setMedicoes] = useState<MedicaoGrid[]>([]);
  const [aba, setAba] = useState<"apontamento" | "materiais">("apontamento");
  const [modulo, setModulo] = useState<"home" | "materiais" | "passagens">(
    "home",
  );

  // Função removida - agora Passagens é integrado no portal

  const qtdEventosNumero =
    !qtdEventos || qtdEventos === "Nenhuma" ? 0 : Number(qtdEventos);
  // Estado removido - todos os campos são exibidos por padrão

  useEffect(() => {
    carregarMateriais();
    carregarMedicoes();
  }, []);

  const normalizarTexto = (s: string) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const materiaisDoProjetoSelecionado = (codigoProjeto: string) => {
    const candidatosProjeto = materiais.filter((m) => (m.codigoProjeto || "") === codigoProjeto);
    return candidatosProjeto.length > 0 ? candidatosProjeto : materiais;
  };

  const opcoesEstoquePorCategoria = (
    codigoProjeto: string,
    palavrasChave: string[],
  ): Material[] => {
    const base = materiaisDoProjetoSelecionado(codigoProjeto);
    const kws = palavrasChave.map(normalizarTexto).filter(Boolean);
    return base
      .filter((m) => {
        const desc = normalizarTexto(m.descricao || "");
        return kws.some((k) => desc.includes(k));
      })
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || "", "pt-BR"));
  };

  const materialPorCodigo = (codigoItem: string) =>
    materiais.find((m) => m.codigoItem === codigoItem) || null;

  const opcoesFixasPorDescricao = (codigoProjeto: string, descricoes: string[]) => {
    const base = materiaisDoProjetoSelecionado(codigoProjeto);
    const vistos = new Set<number>();
    const result: Material[] = [];

    const limparDescEstoque = (s: string) => {
      // remove prefixos comuns tipo "01 - ", "07 - ", "01 -", etc.
      const t = (s || "").replace(/^\s*\d+\s*[-–]\s*/g, "");
      return normalizarTexto(t).replace(/\s+/g, " ").trim();
    };

    const tokens = (s: string) =>
      limparDescEstoque(s)
        .split(" ")
        .filter((x) => x.length >= 3);

    for (const alvo of descricoes) {
      const n = limparDescEstoque(alvo);
      const alvoTokens = tokens(alvo);
      const match =
        // 1) match exato (já normalizado e sem prefixo)
        base.find((m) => limparDescEstoque(m.descricao || "") === n) ||
        // 2) contém em qualquer direção (para casos com complementos)
        base.find((m) => limparDescEstoque(m.descricao || "").includes(n)) ||
        base.find((m) => n.includes(limparDescEstoque(m.descricao || ""))) ||
        // 3) match por tokens (exige pelo menos 2 tokens baterem)
        base.find((m) => {
          const d = tokens(m.descricao || "");
          const ok = alvoTokens.filter((t) => d.includes(t)).length;
          return ok >= Math.min(2, alvoTokens.length);
        });
      if (match && !vistos.has(match.id)) {
        vistos.add(match.id);
        result.push(match);
      }
    }

    return result;
  };

  const LISTA_GEL = [
    "Mankiewicz - ALEXIT BladeRep Hardener 12",
    "Mankiewicz - ALEXIT BladeRep Topcoat 12 - 3020",
    "Mankiewicz - ALEXIT BladeRep Topcoat 12 - 7035",
    "Mankiewicz - ALEXIT BladeRep Topcoat 12 - 9003",
    "Mankiewicz - ALEXIT BladeRep Topcoat 12 - 9018",
    "Mankiewicz - ALEXIT BR12T4 - BLADEREP THINNER 12 MEDIUM",
  ];

  const LISTA_RESINA = [
    "ENDURECEDOR EPOXY LH635",
    "RESINA EPOXY LR635",
    "AMPREG30 RESIN 18KG A/F",
    "AMPREG31 RESIN 18KG A/F",
    "SIKA BIRESIN CR910 (A) - 10KG",
    "SIKA BIRESIN CR910 (B) - 2KG",
  ];

  const opcoesFixasComStatus = (codigoProjeto: string, descricoes: string[]) => {
    const base = materiaisDoProjetoSelecionado(codigoProjeto);
    const limparDescEstoque = (s: string) =>
      normalizarTexto((s || "").replace(/^\s*\d+\s*[-–]\s*/g, "")).replace(/\s+/g, " ").trim();

    const tokens = (s: string) => limparDescEstoque(s).split(" ").filter((x) => x.length >= 3);

    const opts = descricoes.map((desc) => {
      const alvo = limparDescEstoque(desc);
      const alvoTokens = tokens(desc);
      const match =
        base.find((m) => limparDescEstoque(m.descricao || "") === alvo) ||
        base.find((m) => limparDescEstoque(m.descricao || "").includes(alvo)) ||
        base.find((m) => alvo.includes(limparDescEstoque(m.descricao || ""))) ||
        base.find((m) => {
          const d = tokens(m.descricao || "");
          const ok = alvoTokens.filter((t) => d.includes(t)).length;
          return ok >= Math.min(2, alvoTokens.length);
        }) ||
        null;

      return {
        descricao: desc,
        codigoItem: match?.codigoItem || "",
        encontrado: Boolean(match),
      };
    });
    return mostrarSomenteNoEstoque ? opts.filter((o) => o.encontrado) : opts;
  };

  const abrirEdicaoMaterial = (m: Material) => {
    setMaterialEditando(m);
    setEditDescricao(m.descricao || "");
    setEditUnidade(m.unidade || "");
    setEditEstoqueInicial(String(m.estoqueInicial ?? 0));
    setEditEstoqueAtual(String(m.estoqueAtual ?? 0));
  };

  const fecharEdicaoMaterial = () => {
    setMaterialEditando(null);
    setEditDescricao("");
    setEditUnidade("");
    setEditEstoqueInicial("0");
    setEditEstoqueAtual("0");
  };

  const salvarEdicaoMaterial = async () => {
    if (!materialEditando) return;
    setEditandoSalvando(true);
    setErro(null);
    try {
      const payload = {
        descricao: editDescricao,
        unidade: editUnidade,
        estoqueInicial: Number(editEstoqueInicial || 0),
        estoqueAtual: Number(editEstoqueAtual || 0),
      };
      const resp = await axios.put(`${API_BASE_URL}/materiais/${materialEditando.id}`, payload);
      const atualizado: Material = resp.data;
      setMateriais((prev) => prev.map((x) => (x.id === atualizado.id ? atualizado : x)));
      fecharEdicaoMaterial();
    } catch (e: any) {
      console.error(e);
      setErro(e?.response?.data?.error || "Erro ao salvar edição do material.");
    } finally {
      setEditandoSalvando(false);
    }
  };

  const removerMaterial = async (m: Material) => {
    const nome = `${m.codigoItem} - ${m.descricao}${m.codigoProjeto ? ` (${m.codigoProjeto})` : ""}`;
    const ok = window.confirm(`Tem certeza que deseja remover este material?\n\n${nome}\n\nEssa ação é irreversível.`);
    if (!ok) return;
    setErro(null);
    try {
      await axios.delete(`${API_BASE_URL}/materiais/${m.id}`);
      setMateriais((prev) => prev.filter((x) => x.id !== m.id));
    } catch (e: any) {
      console.error(e);
      setErro(e?.response?.data?.error || "Erro ao remover material.");
    }
  };

  async function carregarMateriais() {
    try {
      setLoading(true);
      const resposta = await axios.get<Material[]>(`${API_BASE_URL}/materiais`);
      setMateriais(resposta.data);
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro("Erro ao carregar materiais.");
    } finally {
      setLoading(false);
    }
  }

  async function carregarMedicoes() {
    try {
      const resposta = await axios.get<any[]>(`${API_BASE_URL}/medicoes`);
      const linhas: MedicaoGrid[] = resposta.data.map((m) => ({
        id: m.id,
        dia: m.dia,
        semana: m.semana,
        cliente: m.cliente,
        projeto: m.projeto,
        escala: m.escala,
        tecnicoLider: m.tecnicoLider,
        quantidadeTecnicos: m.quantidadeTecnicos,
        nomesTecnicos: m.nomesTecnicos,
        tipoHora: m.tipoHora,
        horaInicio: m.horaInicio,
        horaFim: m.horaFim,
        codigoItem: m.material?.codigoItem ?? "",
        descricaoMaterial: m.material?.descricao ?? "",
        unidadeMaterial: m.material?.unidade ?? "",
        quantidadeConsumida: Number(m.quantidadeConsumida ?? 0),
        torre: m.torre ?? null,
        criadoEm: m.data,
      }));
      setMedicoes(linhas);
    } catch (e) {
      console.error(e);
    }
  }

  async function registrarMedicao(e: React.FormEvent) {
    e.preventDefault();
    try {
      const projetoSelecionado = projetoMedicao || "PROJETO-TESTE";

      // Consumir materiais automaticamente pelos campos do formulário
      const consumos: Array<{ tipo: string; codigoItem: string; quantidade: number }> = [];
      const qResina = Number(resinaQuantidade || 0);
      const qMassa = Number(massaQuantidade || 0);
      const qPU = Number(puMassaPeso || 0);
      const qGel = Number(gelPeso || 0);

      if (resinaTipo && qResina > 0) consumos.push({ tipo: "Resina", codigoItem: resinaTipo, quantidade: qResina });
      if (massaTipo && qMassa > 0) consumos.push({ tipo: "Massa", codigoItem: massaTipo, quantidade: qMassa });
      if (puTipo && qPU > 0) consumos.push({ tipo: "PU", codigoItem: puTipo, quantidade: qPU });
      if (gelTipo && qGel > 0) consumos.push({ tipo: "Gel", codigoItem: gelTipo, quantidade: qGel });

      if (consumos.length === 0) {
        setErro("Preencha pelo menos um consumo (Resina/Massa/PU/Gel) com quantidade > 0.");
        return;
      }

      for (const c of consumos) {
        const material = materialPorCodigo(c.codigoItem);
        if (!material) {
          setErro(`Não encontrei no estoque o Nº do item "${c.codigoItem}" para "${c.tipo}".`);
          return;
        }

        await axios.post(`${API_BASE_URL}/medicoes`, {
          codigoItem: material.codigoItem,
          quantidadeConsumida: Number(c.quantidade),
          projeto: projetoSelecionado,
          torre: torreMedicao || null,
          origem: "web",
          dia,
          semana,
          cliente,
          escala,
          quantidadeTecnicos: qtdTecnicos ? Number(qtdTecnicos) : null,
          tecnicoLider,
          nomesTecnicos,
          supervisor,
          tipoIntervalo,
          tipoAcesso,
          pa,
          plataforma,
          equipe,
          tipoHora,
          quantidadeEventos: qtdEventos ? Number(qtdEventos) : null,
          horaInicio,
          horaFim,
          tipoDano,
          danoCodigo,
          larguraDanoMm: larguraDano ? Number(larguraDano) : null,
          comprimentoDanoMm: comprimentoDano ? Number(comprimentoDano) : null,
          etapaProcesso,
          etapaLixamento,
          // Guardar no registro o nome (descrição) do estoque, e não apenas o código
          resinaTipo: resinaTipo ? materialPorCodigo(resinaTipo)?.descricao || null : null,
          resinaQuantidade: resinaQuantidade ? Number(resinaQuantidade) : null,
          resinaCatalisador,
          resinaLote,
          resinaValidade,
          massaTipo: massaTipo ? materialPorCodigo(massaTipo)?.descricao || null : null,
          massaQuantidade: massaQuantidade ? Number(massaQuantidade) : null,
          massaCatalisador,
          massaLote,
          massaValidade,
          nucleoTipo,
          nucleoEspessuraMm: nucleoEspessura ? Number(nucleoEspessura) : null,
          puTipo: puTipo ? materialPorCodigo(puTipo)?.descricao || null : null,
          puMassaPeso: puMassaPeso ? Number(puMassaPeso) : null,
          puCatalisadorPeso: puCatalisadorPeso ? Number(puCatalisadorPeso) : null,
          puLote,
          puValidade,
          gelTipo: gelTipo ? materialPorCodigo(gelTipo)?.descricao || null : null,
          gelPeso: gelPeso ? Number(gelPeso) : null,
          gelCatalisadorPeso: gelCatalisadorPeso ? Number(gelCatalisadorPeso) : null,
          gelLote,
          gelValidade,
          retrabalho: retrabalho === "Sim",
        });
      }

      setProjetoMedicao("");
      setTorreMedicao("");
      setDia("");
      setSemana("");
      setCliente("");
      setEscala("");
      setQtdTecnicos("");
      setTecnicoLider("");
      setNomesTecnicos("");
      setSupervisor("");
      setTipoIntervalo("");
      setTipoAcesso("");
      setPa("");
      setPlataforma("");
      setEquipe("");
      setTipoHora("");
      setQtdEventos("");
      setHoraInicio("");
      setHoraFim("");
      setTipoDano("");
      setDanoCodigo("");
      setLarguraDano("");
      setComprimentoDano("");
      setEtapaProcesso("");
      setEtapaLixamento("");
      setResinaTipo("");
      setResinaQuantidade("");
      setResinaCatalisador("");
      setResinaLote("");
      setResinaValidade("");
      setMassaTipo("");
      setMassaQuantidade("");
      setMassaCatalisador("");
      setMassaLote("");
      setMassaValidade("");
      setNucleoTipo("");
      setNucleoEspessura("");
      setPuTipo("");
      setPuMassaPeso("");
      setPuCatalisadorPeso("");
      setPuLote("");
      setPuValidade("");
      setGelTipo("");
      setGelPeso("");
      setGelCatalisadorPeso("");
      setGelLote("");
      setGelValidade("");
      setRetrabalho("");

      await carregarMateriais();
      await carregarMedicoes();
      setErro(null);
    } catch (e) {
      console.error(e);
      setErro("Erro ao registrar medição.");
    }
  }

  async function salvarMaterial(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/materiais`, {
        codigoItem,
        descricao,
        unidade,
        estoqueInicial: Number(estoqueInicial),
      });
      setCodigoItem("");
      setDescricao("");
      setUnidade("KG");
      setEstoqueInicial("0");
      await carregarMateriais();
    } catch (e) {
      console.error(e);
      setErro("Erro ao salvar material.");
    }
  }

  // Importa materiais do Excel (formato: Nº do item | Descrição | Unidade | Em estoque)
  // Aceita tanto tab quanto ponto e vírgula como separador
  async function importarMateriais(e: React.FormEvent) {
    e.preventDefault();

    if (!textoImportacao.trim()) {
      setErro("Por favor, cole os dados do Excel.");
      return;
    }

    const linhas = textoImportacao
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (linhas.length === 0) {
      setErro("Nenhuma linha encontrada. Verifique se copiou os dados corretamente.");
      return;
    }

    // Detecta índices das colunas na primeira linha (cabeçalho)
    const primeiraLinha = linhas[0];
    const partesPrimeira = primeiraLinha.split(/[\t;]+/).map(p => p.trim());
    
    // Função auxiliar para encontrar índice de coluna
    const encontrarIndice = (palavras: string[]): number => {
      for (const palavra of palavras) {
        const idx = partesPrimeira.findIndex((p: string) => 
          p.toLowerCase().includes(palavra.toLowerCase())
        );
        if (idx !== -1) return idx;
      }
      return -1;
    };
    
    // Mapear todas as colunas
    const codigoEstoqueIndex = encontrarIndice(["código do estoque", "codigo do estoque", "código estoque", "codigo estoque"]);
    const descricaoEstoqueIndex = encontrarIndice(["descrição do e", "descricao do e", "descrição estoque", "descricao estoque"]);
    const codigoIndex = encontrarIndice(["nº do item", "numero do item", "número do item", "nº item", "numero item", "número item", "codigo", "código", "item"]);
    const descIndex = encontrarIndice(["descrição do item", "descricao do item", "descrição item", "descricao item", "descrição", "descricao", "desc"]);
    const unidIndex = encontrarIndice(["unidade de medida", "unidade medida", "unidade", "medida", "um"]);
    const estoqueIndex = encontrarIndice(["em estoque", "estoque", "disponível", "disponivel", "quantidade"]);
    const confirmadoIndex = encontrarIndice(["confirmado"]);
    const pedidoIndex = encontrarIndice(["pedido"]);
    const disponivelIndex = encontrarIndice(["disponível", "disponivel"]);
    const precoItemIndex = encontrarIndice(["preço do item", "preco do item", "preço item", "preco item", "preço", "preco", "valor"]);
    const totalIndex = encontrarIndice(["total"]);
    const codigoProjetoIndex = encontrarIndice(["cód. projeto", "cod. projeto", "codigo projeto", "código projeto", "projeto"]);
    const descricaoProjetoIndex = encontrarIndice(["desc. projeto", "desc projeto", "descrição projeto", "descricao projeto"]);
    const centroCustosIndex = encontrarIndice(["centro de custos", "centro custos", "dimensão 1", "dimensao 1"]);
    
    // Se não encontrou no cabeçalho, tenta detectar pela estrutura dos dados
    // (código já foi mapeado acima, então se chegou aqui e codigoIndex === -1, não encontrou)

    if (codigoIndex === -1) {
      setErro("Não foi possível identificar a coluna 'Nº do item'. Certifique-se de copiar as colunas: Nº do item, Descrição do item, Unidade de medida, Em estoque");
      return;
    }

    // Processa as linhas (pula o cabeçalho se for texto)
    const linhasDados = linhas.filter((linha, index) => {
      if (index === 0) {
        // Verifica se a primeira linha é cabeçalho (não tem código numérico ou alfanumérico)
        const partes = linha.split(/[\t;]+/).map(p => p.trim());
        const codigo = partes[codigoIndex] || "";
        // Se não tem código válido (numérico ou alfanumérico), é cabeçalho
        return !(codigo.match(/^[A-Z]\d+/) || codigo.match(/^\d+/) || codigo.match(/^[A-Z0-9]+/));
      }
      return true;
    });

    // Função auxiliar para converter números
    const converterNumero = (valor: string | undefined): number | undefined => {
      if (!valor || valor.trim() === "") return undefined;
      try {
        const limpo = valor
          .toString()
          .replace(/\./g, "") // Remove pontos de milhar
          .replace(",", ".") // Converte vírgula para ponto decimal
          .replace(/[^\d.-]/g, ""); // Remove caracteres não numéricos exceto ponto e menos
        const num = parseFloat(limpo);
        return isNaN(num) ? undefined : num;
      } catch {
        return undefined;
      }
    };

    const itens = linhasDados.map((linha) => {
      const partes = linha.split(/[\t;]+/).map(p => p.trim());
      
      const codigo = partes[codigoIndex] || "";
      const desc = partes[descIndex] || "";
      const unid = partes[unidIndex] || "KG";
      const estoqueStr = partes[estoqueIndex] || "0";
      
      return {
        codigoItem: codigo,
        descricao: desc,
        unidade: unid || "KG",
        estoqueInicial: converterNumero(estoqueStr) || 0,
        codigoEstoque: codigoEstoqueIndex !== -1 ? partes[codigoEstoqueIndex] : undefined,
        descricaoEstoque: descricaoEstoqueIndex !== -1 ? partes[descricaoEstoqueIndex] : undefined,
        confirmado: confirmadoIndex !== -1 ? converterNumero(partes[confirmadoIndex]) : undefined,
        pedido: pedidoIndex !== -1 ? converterNumero(partes[pedidoIndex]) : undefined,
        disponivel: disponivelIndex !== -1 ? converterNumero(partes[disponivelIndex]) : undefined,
        precoItem: precoItemIndex !== -1 ? converterNumero(partes[precoItemIndex]) : undefined,
        total: totalIndex !== -1 ? converterNumero(partes[totalIndex]) : undefined,
        codigoProjeto: codigoProjetoIndex !== -1 ? partes[codigoProjetoIndex] : undefined,
        descricaoProjeto: descricaoProjetoIndex !== -1 ? partes[descricaoProjetoIndex] : undefined,
        centroCustos: centroCustosIndex !== -1 ? partes[centroCustosIndex] : undefined,
      };
    }).filter(item => {
      // Filtra apenas itens válidos (aceita códigos numéricos ou alfanuméricos)
      return item.codigoItem && 
             item.codigoItem.trim().length > 0 &&
             (item.codigoItem.match(/^[A-Z]\d+/) || item.codigoItem.match(/^\d+/) || item.codigoItem.match(/^[A-Z0-9]+/)) && 
             item.descricao && 
             item.descricao.length > 0;
    });

    if (itens.length === 0) {
      setErro("Nenhum item válido encontrado. Verifique se copiou as colunas corretas incluindo o cabeçalho. Os códigos podem ser numéricos (ex: 1231) ou alfanuméricos (ex: E00128).");
      return;
    }
    
    console.log("Itens processados:", itens.length);
    console.log("Primeiros 3 itens:", itens.slice(0, 3));

    try {
      setErro(null);
      setLoading(true);
      
      // Processar em lotes de 500 itens para evitar erro de payload muito grande
      const tamanhoLote = 500;
      const lotes = [];
      for (let i = 0; i < itens.length; i += tamanhoLote) {
        lotes.push(itens.slice(i, i + tamanhoLote));
      }
      
      console.log(`Enviando ${itens.length} itens em ${lotes.length} lote(s) de até ${tamanhoLote} itens cada...`);
      
      let totalImportado = 0;
      const errosLotes = [];
      
      for (let i = 0; i < lotes.length; i++) {
        const lote = lotes[i];
        console.log(`Processando lote ${i + 1}/${lotes.length} (${lote.length} itens)...`);
        
        try {
          const response = await axios.post(`${API_BASE_URL}/materiais/import`, { itens: lote });
          const quantidadeImportada = response.data?.quantidadeImportada || lote.length;
          totalImportado += quantidadeImportada;
          console.log(`Lote ${i + 1} processado: ${quantidadeImportada} itens`);
        } catch (e: any) {
          console.error(`Erro no lote ${i + 1}:`, e.response?.data || e.message);
          errosLotes.push(`Lote ${i + 1}: ${e.response?.data?.error || e.message}`);
        }
      }
      
      if (totalImportado > 0) {
        setMensagemImportacao(
          `Importação concluída! ${totalImportado} de ${itens.length} material(is) importado(s) com sucesso.${errosLotes.length > 0 ? ` (${errosLotes.length} lote(s) com erro)` : ""}`
        );
        setTextoImportacao("");
        await carregarMateriais();
      } else {
        throw new Error("Nenhum item foi importado. Verifique os erros acima.");
      }
      
      if (errosLotes.length > 0) {
        console.warn("Erros em alguns lotes:", errosLotes);
      }
    } catch (e: any) {
      console.error("Erro completo:", e);
      console.error("Resposta do erro:", e.response?.data);
      const mensagemErro = e.response?.data?.error || e.message || "Erro ao importar materiais. Verifique o formato dos dados e se o backend está rodando.";
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  }

  async function importarArquivoExcel(e: React.FormEvent) {
    e.preventDefault();

    if (!arquivoExcel) {
      setErro("Por favor, selecione um arquivo Excel (.xlsx ou .xls).");
      return;
    }

    const formData = new FormData();
    formData.append("arquivo", arquivoExcel);

    try {
      setErro(null);
      setMensagemImportacao(null);
      setLoading(true);
      
      const response = await axios.post(
        `${API_BASE_URL}/materiais/import-excel`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { quantidadeImportada, erros } = response.data;
      
      setMensagemImportacao(
        `Importação concluída! ${quantidadeImportada} material(is) importado(s) com sucesso.${erros && erros.length > 0 ? ` (${erros.length} erro(s) ignorado(s))` : ""}`
      );
      
      if (erros && erros.length > 0) {
        console.warn("Erros durante importação:", erros);
      }
      
      setArquivoExcel(null);
      await carregarMateriais();
    } catch (e: any) {
      console.error(e);
      setErro(
        e.response?.data?.error || 
        e.response?.data?.detalhes || 
        "Erro ao importar arquivo Excel. Verifique se o arquivo está no formato correto."
      );
    } finally {
      setLoading(false);
    }
  }

  // Quando o módulo selecionado é "passagens" ou "materiais", renderiza em tela cheia,
  // sem mostrar o cabeçalho nem o conteúdo do portal.
  if (modulo === "passagens") {
    return (
      <div className="app-shell passagens-fullscreen" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="passagens-container"
          style={{
            width: "100%",
            minHeight: "100vh",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            type="button"
            onClick={() => setModulo("home")}
            style={{
              alignSelf: "flex-start",
              margin: "8px 8px 0 8px",
              padding: "8px 16px",
              background: "#ffffff",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              zIndex: 1,
              position: "relative",
            }}
          >
            ← Voltar ao portal
          </button>
          <iframe
            src="https://gwindapp-passagen.netlify.app/dashboard"
            style={{
              width: "100%",
              flex: 1,
              minHeight: "0",
              border: "none",
              display: "block",
            }}
            title="Sistema de Passagens Aéreas"
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-logo">
            <div className="logo-mark">
              <svg
                viewBox="0 0 100 100"
                className="logo-turbine-svg"
                aria-hidden="true"
              >
                {/* torre (mais larga e alta) */}
                <rect
                  x="45"
                  y="44"
                  width="10"
                  height="44"
                  rx="3.5"
                  fill="#e5f2ff"
                />
                {/* cubo central */}
                <circle
                  cx="50"
                  cy="40"
                  r="6"
                  fill="#ffffff"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                {/* pás (mais largas e compridas) */}
                <g className="turbine-blades">
                  <rect
                    x="48"
                    y="6"
                    width="4"
                    height="32"
                    rx="2"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="0.7"
                  />
                  <rect
                    x="48"
                    y="6"
                    width="4"
                    height="32"
                    rx="2"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="0.7"
                    transform="rotate(120 50 40)"
                  />
                  <rect
                    x="48"
                    y="6"
                    width="4"
                    height="32"
                    rx="2"
                    fill="#ffffff"
                    stroke="#ffffff"
                    strokeWidth="0.7"
                    transform="rotate(240 50 40)"
                  />
                </g>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">G.WIND</span>
              <span className="logo-subtitle">Services for Wind Technology</span>
            </div>
          </div>
          <nav className="topbar-nav">
            <button
              type="button"
              className="topbar-link"
              onClick={() => setModulo("home")}
            >
              Home
            </button>
            <button
              type="button"
              className="topbar-link"
              onClick={() => setModulo("materiais")}
            >
              Materiais
            </button>
            <button
              type="button"
              className="topbar-link"
              onClick={() => setModulo("passagens")}
            >
              Passagens
            </button>
          </nav>
        </div>
      </header>

      <div className="container">
      <header className="header">
        <h1>Portal da Empresa</h1>
        <p>Módulo web – acesso a materiais, passagens e outros setores.</p>
      </header>

      {modulo === "home" && (
        <section className="card">
          <h2>Escolha um módulo</h2>
          <p style={{ color: "#9ca3af", marginBottom: 12 }}>
            Selecione abaixo o setor que deseja acessar.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
              alignItems: "stretch",
            }}
          >
            {/* Passagens à esquerda */}
            <button
              type="button"
              className="primary-button"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "180px",
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 16,
              }}
              onClick={() => setModulo("passagens")}
            >
              <span style={{ fontSize: 26, marginBottom: 2 }}>✈️</span>
              <span style={{ fontWeight: 700 }}>Passagens Aéreas</span>
              <span style={{ fontSize: 13, color: "#020617" }}>
                Solicitações de viagem e cotações.
              </span>
            </button>

            {/* Materiais no meio */}
            <button
              type="button"
              className="primary-button"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "180px",
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 16,
              }}
              onClick={() => setModulo("materiais")}
            >
              <span style={{ fontSize: 26, marginBottom: 2 }}>📦</span>
              <span style={{ fontWeight: 700 }}>Materiais / Estoque</span>
              <span style={{ fontSize: 13, color: "#020617" }}>
                Medição de consumo, controle de saldo e cadastro de itens.
              </span>
            </button>

            {/* Outros módulos à direita */}
            <button
              type="button"
              disabled
              className="primary-button"
              style={{
                width: "100%",
                height: "100%",
                minHeight: "180px",
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: 16,
                opacity: 0.4,
                cursor: "not-allowed",
              }}
            >
              <span style={{ fontSize: 26, marginBottom: 2 }}>⚙️</span>
              <span style={{ fontWeight: 700 }}>Outros módulos</span>
              <span style={{ fontSize: 13, color: "#020617" }}>
                Espaço reservado para futuros setores (RH, Segurança, etc.).
              </span>
            </button>
          </div>
        </section>
      )}

      {modulo === "materiais" && (
        <div className="app-shell materiais-fullscreen" style={{ padding: 0, overflow: "auto", background: "#f5f7fa" }}>
          <div
            className="materiais-container"
            style={{
              width: "100%",
              minHeight: "100vh",
              background: "#f5f7fa",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ 
              background: "#ffffff", 
              borderBottom: "1px solid #e5e7eb",
              padding: "12px 16px",
              position: "sticky",
              top: 0,
              zIndex: 100,
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>Controle de Materiais</h1>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "4px 0 0 0" }}>Módulo web – apontamento e controle de materiais.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModulo("home")}
                  style={{
                    padding: "8px 16px",
                    background: "#ffffff",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#374151",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  ← Voltar ao portal
                </button>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setAba("apontamento")}
                  style={{
                    padding: "8px 16px",
                    background: aba === "apontamento" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                    color: aba === "apontamento" ? "#ffffff" : "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: aba === "apontamento" ? "0 2px 4px rgba(102, 126, 234, 0.3)" : "none",
                  }}
                >
                  Apontamento
                </button>
                <button
                  type="button"
                  onClick={() => setAba("materiais")}
                  style={{
                    padding: "8px 16px",
                    background: aba === "materiais" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                    color: aba === "materiais" ? "#ffffff" : "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    boxShadow: aba === "materiais" ? "0 2px 4px rgba(102, 126, 234, 0.3)" : "none",
                  }}
                >
                  Materiais
                </button>
              </div>
            </div>
            <div style={{ flex: 1, padding: "16px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>

      {aba === "materiais" && (
        <>
      {/* Importação em massa - PRIMEIRO, mais visível */}
      <section className="card" style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)", border: "2px solid #667eea" }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e40af", marginBottom: "8px" }}>
          ⚡ Importar Todos os Materiais de Uma Vez
        </h2>
        <p style={{ fontSize: 14, color: "#1e40af", marginBottom: 24, fontWeight: 500 }}>
          Importe todos os materiais da planilha Excel de uma só vez! O sistema identifica automaticamente todas as colunas.
        </p>
        
        {/* Opção principal: colar dados (mais simples) */}
        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "8px", color: "#1f2937" }}>
            📋 Método Rápido: Cole a planilha do Excel
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "12px" }}>
            Abra o Excel, selecione TODAS as colunas (incluindo o cabeçalho) e cole aqui. É mais rápido!
          </p>
          <form onSubmit={importarMateriais}>
            <textarea
              value={textoImportacao}
              onChange={(e) => setTextoImportacao(e.target.value)}
              placeholder="1. Abra o Excel e selecione TODAS as colunas (incluindo cabeçalho)&#10;2. Copie (Ctrl+C)&#10;3. Cole aqui (Ctrl+V)&#10;&#10;O sistema identifica automaticamente: Código do Estoque, Descrição do E, Nº do item, Descrição do item, Unidade, Em estoque, Confirmado, Pedido, Disponível, Preço, Total, Cód. Projeto, Desc. Projeto, Centro de Custos..."
              style={{
                width: "100%",
                minHeight: "200px",
                padding: "12px",
                borderRadius: "8px",
                border: "2px solid #667eea",
                fontSize: "0.875rem",
                fontFamily: "monospace",
                marginBottom: "12px",
                backgroundColor: "#ffffff",
              }}
            />
            <button type="submit" className="primary-button" style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.125rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
            }}>
              🚀 Importar Todos os Materiais
            </button>
          </form>
        </div>

        {/* Opção alternativa: upload de arquivo */}
        <div style={{ 
          borderTop: "2px solid #cbd5e1", 
          paddingTop: "24px",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "8px", color: "#374151" }}>
            📁 Ou faça upload do arquivo Excel (.xlsx ou .xls)
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "12px" }}>
            Se preferir, você pode fazer upload do arquivo completo.
          </p>
          <form onSubmit={importarArquivoExcel}>
            <div style={{ marginBottom: "12px" }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setArquivoExcel(file);
                    setErro(null);
                    setMensagemImportacao(null);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              />
            </div>
            {arquivoExcel && (
              <p style={{ fontSize: "0.875rem", color: "#16a34a", marginBottom: "12px" }}>
                Arquivo selecionado: <strong>{arquivoExcel.name}</strong>
              </p>
            )}
            <button 
              type="submit" 
              className="primary-button" 
              disabled={!arquivoExcel || loading}
              style={{
                padding: "12px 24px",
                background: arquivoExcel && !loading 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
                  : "#9ca3af",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: arquivoExcel && !loading ? "pointer" : "not-allowed",
                boxShadow: arquivoExcel && !loading 
                  ? "0 4px 12px rgba(102, 126, 234, 0.3)" 
                  : "none",
              }}
            >
              {loading ? "Importando..." : "Importar do Excel"}
            </button>
          </form>
        </div>

        {mensagemImportacao && (
          <p style={{ marginTop: 16, fontSize: 14, color: "#16a34a", fontWeight: 500, padding: "12px", backgroundColor: "#f0fdf4", borderRadius: "8px", border: "1px solid #86efac" }}>
            ✅ {mensagemImportacao}
          </p>
        )}
      </section>

      {/* Dashboard de Estoque */}
      <section className="card">
        <h2 style={{ marginBottom: "20px" }}>Dashboard de Estoque</h2>
        {materiais.length === 0 ? (
          <p style={{ color: "#6b7280", textAlign: "center", padding: "40px" }}>
            Nenhum material cadastrado. Importe os materiais do Excel para ver o dashboard.
          </p>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "16px",
            marginBottom: "24px"
          }}>
            {materiais
              .filter(m => 
                !buscaEstoque || 
                m.codigoItem.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
                m.descricao.toLowerCase().includes(buscaEstoque.toLowerCase())
              )
              .map((m) => {
                const percentual = m.estoqueInicial > 0 
                  ? (m.estoqueAtual / m.estoqueInicial) * 100 
                  : 0;
                const statusCor = percentual > 50 ? "#10b981" : percentual > 20 ? "#f59e0b" : "#ef4444";
                const statusTexto = percentual > 50 ? "Bom" : percentual > 20 ? "Atenção" : "Crítico";
                
                return (
                  <div 
                    key={m.id}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: 600, 
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "4px"
                      }}>
                        {m.codigoItem}
                      </div>
                      <div style={{ 
                        fontSize: "0.875rem", 
                        color: "#374151",
                        fontWeight: 500,
                        lineHeight: "1.4",
                        marginBottom: "8px"
                      }}>
                        {m.descricao.length > 50 ? m.descricao.substring(0, 50) + "..." : m.descricao}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "6px"
                      }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Estoque atual</span>
                        <span style={{ 
                          fontSize: "1rem", 
                          fontWeight: 700, 
                          color: m.estoqueAtual < 0 ? "#ef4444" : "#1f2937"
                        }}>
                          {m.estoqueAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {m.unidade}
                        </span>
                      </div>
                      
                      {/* Barra de progresso */}
                      <div style={{
                        width: "100%",
                        height: "8px",
                        background: "#e5e7eb",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "6px"
                      }}>
                        <div style={{
                          width: `${Math.min(percentual, 100)}%`,
                          height: "100%",
                          background: statusCor,
                          transition: "width 0.3s ease"
                        }} />
                      </div>
                      
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center"
                      }}>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {m.estoqueInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {m.unidade} inicial
                        </span>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          background: `${statusCor}20`,
                          color: statusCor,
                        }}>
                          {statusTexto} ({percentual.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Cadastrar / Atualizar Material</h2>
        <form className="form" onSubmit={salvarMaterial}>
          <div className="form-row">
            <label>
              Nº do item (código do estoque)
              <input
                value={codigoItem}
                onChange={(e) => setCodigoItem(e.target.value)}
                required
              />
            </label>
            <label>
              Descrição
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Unidade
              <input
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                required
              />
            </label>
            <label>
              Estoque inicial
              <input
                type="number"
                step="0.01"
                value={estoqueInicial}
                onChange={(e) => setEstoqueInicial(e.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="primary-button">
            Salvar material
          </button>
        </form>
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <h2 style={{ margin: 0 }}>Estoque de Materiais</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={filtroProjeto}
              onChange={(e) => setFiltroProjeto(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                background: "#ffffff",
                color: "#374151",
                cursor: "pointer",
                minWidth: "180px",
              }}
            >
              <option value="">Todos os projetos</option>
              {Array.from(new Set(materiais.map(m => m.codigoProjeto).filter((p): p is string => Boolean(p)))).sort().map((proj) => (
                <option key={proj} value={proj}>
                  {proj} - {materiais.find(m => m.codigoProjeto === proj)?.descricaoProjeto || ""}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Buscar por código ou descrição..."
              value={buscaEstoque}
              onChange={(e) => setBuscaEstoque(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
                minWidth: "200px",
              }}
            />
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {materiais.filter(m => {
                const matchBusca = !buscaEstoque || 
                  m.codigoItem.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
                  m.descricao.toLowerCase().includes(buscaEstoque.toLowerCase());
                const matchProjeto = !filtroProjeto || m.codigoProjeto === filtroProjeto;
                return matchBusca && matchProjeto;
              }).length} material(is)
            </span>
          </div>
        </div>
        {loading && <p>Carregando...</p>}
        {erro && <p className="error">{erro}</p>}
        {!loading && materiais.length === 0 && <p>Nenhum material cadastrado.</p>}

        {materiais.length > 0 && (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table
              className="table"
              style={{
                width: "100%",
                minWidth: "980px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Nº do item</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Descrição</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Projeto</th>
                  <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, color: "#374151" }}>Unidade</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Estoque inicial</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Estoque atual</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {materiais
                  .filter(m => {
                    const matchBusca = !buscaEstoque || 
                      m.codigoItem.toLowerCase().includes(buscaEstoque.toLowerCase()) ||
                      m.descricao.toLowerCase().includes(buscaEstoque.toLowerCase());
                    const matchProjeto = !filtroProjeto || m.codigoProjeto === filtroProjeto;
                    return matchBusca && matchProjeto;
                  })
                  .map((m) => {
                    const percentual = m.estoqueInicial > 0 
                      ? (m.estoqueAtual / m.estoqueInicial) * 100 
                      : 0;
                    const statusCor = percentual > 50 ? "#10b981" : percentual > 20 ? "#f59e0b" : "#ef4444";
                    return (
                      <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "12px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>{m.codigoItem}</td>
                        <td style={{ padding: "12px", color: "#374151" }}>{m.descricao}</td>
                        <td style={{ padding: "12px", color: "#374151" }}>
                          {m.codigoProjeto ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ 
                                display: "inline-block",
                                width: "fit-content",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                background: "#e0f2fe",
                                color: "#0369a1",
                                fontWeight: 600
                              }}>
                                {m.codigoProjeto}
                              </span>
                              {m.descricaoProjeto ? (
                                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                  {m.descricaoProjeto}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", color: "#6b7280", whiteSpace: "nowrap" }}>{m.unidade}</td>
                        <td style={{ padding: "12px", textAlign: "right", color: "#6b7280", whiteSpace: "nowrap" }}>
                          {m.estoqueInicial.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: m.estoqueAtual < 0 ? "#ef4444" : "#1f2937", whiteSpace: "nowrap" }}>
                          {m.estoqueAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: `${statusCor}20`,
                            color: statusCor,
                          }}>
                            {percentual.toFixed(0)}%
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => abrirEdicaoMaterial(m)}
                              style={{ padding: "6px 10px", fontSize: "0.85rem" }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => removerMaterial(m)}
                              style={{
                                padding: "6px 10px",
                                fontSize: "0.85rem",
                                borderColor: "#fecaca",
                                color: "#b91c1c",
                                background: "#fff1f2",
                              }}
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0 }}>Registro de Apontamentos</h2>
            <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 14 }}>
              Histórico de tudo que foi apontado (quem fez, o que gastou e onde).
            </p>
          </div>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            {medicoes.length} registro(s)
          </span>
        </div>

        {medicoes.length === 0 ? (
          <p style={{ color: "#6b7280" }}>Nenhum apontamento registrado ainda.</p>
        ) : (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table className="table" style={{ width: "100%", minWidth: "1100px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Data/Hora</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Quem fez</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Projeto</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Item</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Descrição</th>
                  <th style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Qtd. consumida</th>
                  <th style={{ padding: "12px", textAlign: "center", fontWeight: 600, color: "#374151" }}>Unid.</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>WTG / Torre</th>
                </tr>
              </thead>
              <tbody>
                {medicoes.map((m) => {
                  const quem = (m.tecnicoLider || "").trim() || (m.nomesTecnicos || "").trim() || "—";
                  const dataStr = m.criadoEm ? new Date(m.criadoEm).toLocaleString("pt-BR") : "—";
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px", color: "#374151", whiteSpace: "nowrap" }}>{dataStr}</td>
                      <td style={{ padding: "12px", color: "#374151" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: 600, color: "#111827" }}>{quem}</span>
                          {m.nomesTecnicos && m.nomesTecnicos !== m.tecnicoLider ? (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{m.nomesTecnicos}</span>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: "12px", color: "#374151" }}>{m.projeto || "—"}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>{m.codigoItem || "—"}</td>
                      <td style={{ padding: "12px", color: "#374151" }}>{m.descricaoMaterial || "—"}</td>
                      <td style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: "#1f2937", whiteSpace: "nowrap" }}>
                        {Number(m.quantidadeConsumida || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "12px", textAlign: "center", color: "#6b7280", whiteSpace: "nowrap" }}>{m.unidadeMaterial || "—"}</td>
                      <td style={{ padding: "12px", color: "#374151" }}>{m.torre || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal simples de edição */}
      {materialEditando && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            zIndex: 50,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) fecharEdicaoMaterial();
          }}
        >
          <div
            className="card"
            style={{
              width: "min(680px, 100%)",
              maxHeight: "85vh",
              overflow: "auto",
              boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Editar material</h2>
              <button type="button" className="secondary-button" onClick={fecharEdicaoMaterial}>
                Fechar
              </button>
            </div>

            <p style={{ marginTop: "8px", color: "#6b7280", fontSize: 14 }}>
              {materialEditando.codigoItem} {materialEditando.codigoProjeto ? `• ${materialEditando.codigoProjeto}` : ""}
            </p>

            <div className="form-row" style={{ marginTop: "12px" }}>
              <label>
                Descrição
                <input value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
              </label>
              <label>
                Unidade
                <input value={editUnidade} onChange={(e) => setEditUnidade(e.target.value)} />
              </label>
              <label>
                Estoque inicial
                <input
                  inputMode="decimal"
                  value={editEstoqueInicial}
                  onChange={(e) => setEditEstoqueInicial(e.target.value)}
                />
              </label>
              <label>
                Estoque atual
                <input
                  inputMode="decimal"
                  value={editEstoqueAtual}
                  onChange={(e) => setEditEstoqueAtual(e.target.value)}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
              <button type="button" className="secondary-button" onClick={fecharEdicaoMaterial} disabled={editandoSalvando}>
                Cancelar
              </button>
              <button type="button" className="primary-button" onClick={salvarEdicaoMaterial} disabled={editandoSalvando}>
                {editandoSalvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}


      <section className="card">
        <h2>Integração com Smartsheet</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          Você pode importar os materiais diretamente da planilha de estoque do
          Smartsheet.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            className="primary-button"
            onClick={async () => {
              try {
                setLoading(true);
                await axios.post(`${API_BASE_URL}/materiais/import-smartsheet`);
                await carregarMateriais();
                setMensagemImportacao(
                  "Importação do Smartsheet concluída com sucesso.",
                );
              } catch (e) {
                console.error(e);
                setErro(
                  "Erro ao importar materiais do Smartsheet. Verifique o backend.",
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            Importar do Smartsheet
          </button>
        </div>
      </section>

      <section className="card" style={{ border: "2px solid #ef4444" }}>
        <h2 style={{ color: "#dc2626" }}>⚠️ Gerenciamento de Dados</h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
          <strong>Atenção:</strong> As ações abaixo são irreversíveis. Use apenas para limpar dados de teste.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            type="button"
            onClick={async () => {
              if (!confirm("⚠️ ATENÇÃO: Isso vai apagar TODOS os materiais e medições!\n\nEsta ação é IRREVERSÍVEL.\n\nTem certeza que deseja continuar?")) {
                return;
              }
              
              if (!confirm("⚠️ ÚLTIMA CONFIRMAÇÃO:\n\nVocê realmente quer apagar TODOS os dados?\n\nIsso não pode ser desfeito!")) {
                return;
              }

              try {
                setLoading(true);
                setErro(null);
                const response = await axios.delete(`${API_BASE_URL}/materiais/limpar-tudo`);
                setMensagemImportacao(
                  `Dados apagados com sucesso. ${response.data?.materiaisDeletados || 0} material(is) removido(s).`,
                );
                await carregarMateriais();
              } catch (e: any) {
                console.error(e);
                setErro(
                  e.response?.data?.error || "Erro ao apagar dados. Verifique o backend.",
                );
              } finally {
                setLoading(false);
              }
            }}
            style={{
              padding: "12px 24px",
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
            }}
          >
            🗑️ Limpar Todos os Dados (Teste)
          </button>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "12px" }}>
          Esta ação remove todos os materiais e medições do banco de dados. Use apenas para limpar dados de teste antes de importar a lista real.
        </p>
      </section>
        </>
      )}

      {aba === "apontamento" && (
        <>
      <section className="card" style={{ 
        background: "#ffffff", 
        borderRadius: "12px", 
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        marginBottom: "16px"
      }}>
        <h2 style={{ 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          color: "#1f2937", 
          marginBottom: "24px" 
        }}>Formulário de Medição</h2>
        <form className="form" onSubmit={registrarMedicao} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Campos principais no topo */}
          
          <div>
            <h3 className="section-title" style={{ 
              fontSize: "1rem", 
              fontWeight: 600, 
              color: "#1f2937", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Consumo de Materiais</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
              O desconto do estoque é feito automaticamente pelos campos do formulário (Resina, Massa, PU e Gel).
            </p>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 10, marginTop: 12, fontSize: 14, color: "#374151" }}>
              <input
                type="checkbox"
                checked={mostrarSomenteNoEstoque}
                onChange={(e) => setMostrarSomenteNoEstoque(e.target.checked)}
              />
              Mostrar apenas itens encontrados no estoque
            </label>
          </div>

          <hr style={{ borderColor: "#e5e7eb", margin: "24px 0", borderWidth: "1px" }} />

          <div>
            <h3 className="section-title" style={{ 
              fontSize: "1rem", 
              fontWeight: 600, 
              color: "#1f2937", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Informações gerais</h3>
            <div className="form-row" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Dia</span>
                <input
                  type="date"
                  value={dia}
                  onChange={(e) => setDia(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Semana</span>
                <input
                  value={semana}
                  onChange={(e) => setSemana(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Cliente</span>
                <input
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Projeto</span>
                <input
                  value={projetoMedicao}
                  onChange={(e) => setProjetoMedicao(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </label>
            </div>
          </div>

          <hr style={{ borderColor: "#e5e7eb", margin: "24px 0", borderWidth: "1px" }} />

          <div>
            <h3 className="section-title" style={{ 
              fontSize: "1rem", 
              fontWeight: 600, 
              color: "#1f2937", 
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>Equipe e horário</h3>
            <div className="form-row" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>Escala</span>
                <input
                  value={escala}
                  onChange={(e) => setEscala(e.target.value)}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.875rem",
                  }}
                />
              </label>
            </div>
          </div>

          <div className="form-row">
            <label>
              <span>Qtde Técnicos</span>
              <input
                type="number"
                value={qtdTecnicos}
                onChange={(e) => setQtdTecnicos(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Supervisor</span>
              <input
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Técnico Líder</span>
              <input
                value={tecnicoLider}
                onChange={(e) => setTecnicoLider(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Nome dos Técnicos</span>
              <input
                value={nomesTecnicos}
                onChange={(e) => setNomesTecnicos(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Tipo de Hora</span>
              <input
                value={tipoHora}
                onChange={(e) => setTipoHora(e.target.value)}
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              <span>Qtde de Eventos</span>
              <select
                value={qtdEventos}
                onChange={(e) => setQtdEventos(e.target.value)}
              >
                <option value="">Selecione</option>
                <option value="Nenhuma">Nenhuma</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </label>
          </div>

          {/* HORA 01 - sempre visível */}
          <h3 className="section-title">
            HORA 01 - Horário completo das atividades
          </h3>
          <div className="form-row">
            <label>
              <span>01 - Hora Início</span>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>01 - Hora fim</span>
              <input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
              />
            </label>
          </div>

          {/* HORA 02 - aparece quando Qtde de Eventos >= 1 */}
          {qtdEventosNumero >= 1 && (
            <>
              <h3 className="section-title">
                HORA 02 - Horário completo das atividades
              </h3>
              <div className="form-row">
                <label>
                  <span>02 - Hora Início</span>
                  <input
                    type="time"
                    value={hora2Inicio}
                    onChange={(e) => setHora2Inicio(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>02 - Hora fim</span>
                  <input
                    type="time"
                    value={hora2Fim}
                    onChange={(e) => setHora2Fim(e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

          {/* HORA 03 - aparece quando Qtde de Eventos >= 2 */}
          {qtdEventosNumero >= 2 && (
            <>
              <h3 className="section-title">
                HORA 03 - Horário completo das atividades
              </h3>
              <div className="form-row">
                <label>
                  <span>03 - Hora Início</span>
                  <input
                    type="time"
                    value={hora3Inicio}
                    onChange={(e) => setHora3Inicio(e.target.value)}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>03 - Hora fim</span>
                  <input
                    type="time"
                    value={hora3Fim}
                    onChange={(e) => setHora3Fim(e.target.value)}
                  />
                </label>
              </div>
            </>
          )}

              <h3 className="section-title">Intervalo, acesso e localização</h3>
              <div className="form-row">
                <label>
                  <span>Tipo de Intervalo</span>
                  <input
                    value={tipoIntervalo}
                    onChange={(e) => setTipoIntervalo(e.target.value)}
                  />
                </label>
                <label>
                  <span>Tipo de Acesso</span>
                  <input
                    value={tipoAcesso}
                    onChange={(e) => setTipoAcesso(e.target.value)}
                  />
                </label>
                <label>
                  <span>Pá</span>
                  <input
                    value={pa}
                    onChange={(e) => setPa(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>WTG (Torre)</span>
                  <input
                    value={torreMedicao}
                    onChange={(e) => setTorreMedicao(e.target.value)}
                  />
                </label>
                <label>
                  <span>Plataforma</span>
                  <input
                    value={plataforma}
                    onChange={(e) => setPlataforma(e.target.value)}
                  />
                </label>
                <label>
                  <span>Equipe</span>
                  <input
                    value={equipe}
                    onChange={(e) => setEquipe(e.target.value)}
                  />
                </label>
              </div>

              <h3 className="section-title">Dano e processo</h3>
              <div className="form-row">
                <label>
                  <span>Tipo de Dano</span>
                  <select
                    value={tipoDano}
                    onChange={(e) => setTipoDano(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Erosão">Erosão</option>
                    <option value="Inspeção externa">Inspeção externa</option>
                    <option value="Inspeção interna">Inspeção interna</option>
                    <option value="Inspeção LPS">Inspeção LPS</option>
                    <option value="Trinca transversal">Trinca transversal</option>
                    <option value="Trinca longitudinal">
                      Trinca longitudinal
                    </option>
                    <option value="Trinca diagonal">Trinca diagonal</option>
                    <option value="Delaminação">Delaminação</option>
                    <option value="Ruga">Ruga</option>
                    <option value="Dobra">Dobra</option>
                    <option value="Camada rompida">Camada rompida</option>
                    <option value="Camada seca">Camada seca</option>
                    <option value="Camada queimada">Camada queimada</option>
                    <option value="Falha de Colagem">Falha de Colagem</option>
                    <option value="Impacto de raio">Impacto de raio</option>
                    <option value="Desplacamento">Desplacamento</option>
                    <option value="Bolha">Bolha</option>
                    <option value="Cosmético">Cosmético</option>
                    <option value="Cabo LPS solto">Cabo LPS solto</option>
                    <option value="Cabo LPS desconectado">
                      Cabo LPS desconectado
                    </option>
                    <option value="Cabo LPS danificado">
                      Cabo LPS danificado
                    </option>
                    <option value="Vazios">Vazios</option>
                    <option value="Contaminação por óleo">
                      Contaminação por óleo
                    </option>
                    <option value="Furo do dreno obstruído">
                      Furo do dreno obstruído
                    </option>
                    <option value="Furo de boroscópio">
                      Furo de boroscópio
                    </option>
                    <option value="Furo">Furo</option>
                    <option value="Reparo nao conforme">
                      Reparo nao conforme
                    </option>
                    <option value="Reparo desplacando">
                      Reparo desplacando
                    </option>
                    <option value="Pesagem">Pesagem</option>
                    <option value="Balanceamento">Balanceamento</option>
                    <option value="Instalação fita 3M">Instalação fita 3M</option>
                    <option value="Núcleo danificado">Núcleo danificado</option>
                    <option value="Reposição de shear clip">
                      Reposição de shear clip
                    </option>
                    <option value="Remoção do Shear Clip">
                      Remoção do Shear Clip
                    </option>
                    <option value="Dano no Rib">Dano no Rib</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Dano (código)</span>
                  <select
                    value={danoCodigo}
                    onChange={(e) => setDanoCodigo(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="E01">E01</option>
                    <option value="E02">E02</option>
                    <option value="E03">E03</option>
                    <option value="E04">E04</option>
                    <option value="E05">E05</option>
                    <option value="I01">I01</option>
                    <option value="I02">I02</option>
                    <option value="I03">I03</option>
                    <option value="I04">I04</option>
                    <option value="I05">I05</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Largura do dano (mm)</span>
                  <input
                    type="number"
                    value={larguraDano}
                    onChange={(e) => setLarguraDano(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Comprimento do dano (mm)</span>
                  <input
                    type="number"
                    value={comprimentoDano}
                    onChange={(e) => setComprimentoDano(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>Etapa do Processo</span>
                  <select
                    value={etapaProcesso}
                    onChange={(e) => setEtapaProcesso(e.target.value)}
                  >
                    <option value="">Selecione</option>
                    <option value="Remoção de núcleo">Remoção de núcleo</option>
                    <option value="Lixamento">Lixamento</option>
                    <option value="Colagem de anteparo">
                      Colagem de anteparo
                    </option>
                    <option value="Colagem de núcleo/Ajuste">
                      Colagem de núcleo/Ajuste
                    </option>
                    <option value="Laminação">Laminação</option>
                    <option value="Acabamento">Acabamento</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Inspeção/BOD">Inspeção/BOD</option>
                  </select>
                </label>
              </div>

              <div className="form-row">
                <label>
                  Etapa do Lixamento
                  <input
                    value={etapaLixamento}
                    onChange={(e) => setEtapaLixamento(e.target.value)}
                  />
                </label>
              </div>

              <hr style={{ borderColor: "#1f2937", margin: "16px 0" }} />

              <h3 className="section-title">Resina</h3>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Resina</h3>
              <div className="form-row">
                <label>
                  Qual é a resina
                  <select
                    value={resinaTipo}
                    onChange={(e) => setResinaTipo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    {opcoesFixasComStatus(projetoMedicao || "", LISTA_RESINA).map((o) => (
                      <option
                        key={`resina-${o.descricao}`}
                        value={o.codigoItem || ""}
                        disabled={!o.encontrado}
                      >
                        {o.descricao}
                        {!o.encontrado ? " (não encontrado no estoque)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantidade de resina (kg/g)
                  <input
                    type="number"
                    value={resinaQuantidade}
                    onChange={(e) => setResinaQuantidade(e.target.value)}
                  />
                </label>
                <label>
                  Catalisador da resina
                  <input
                    value={resinaCatalisador}
                    onChange={(e) => setResinaCatalisador(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Lote da resina
                  <input
                    value={resinaLote}
                    onChange={(e) => setResinaLote(e.target.value)}
                  />
                </label>
                <label>
                  Data de validade da resina
                  <input
                    type="date"
                    value={resinaValidade}
                    onChange={(e) => setResinaValidade(e.target.value)}
                  />
                </label>
              </div>

              <hr style={{ borderColor: "#1f2937", margin: "16px 0" }} />

              <h3 className="section-title">Massa de colagem</h3>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Massa de colagem</h3>
              <div className="form-row">
                <label>
                  Massa de colagem
                  <select
                    value={massaTipo}
                    onChange={(e) => setMassaTipo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    {opcoesEstoquePorCategoria(
                      projetoMedicao || "",
                      ["massa", "putty", "adesivo", "bpr", "colagem"],
                    ).map((m) => (
                      <option key={`massa-${m.id}`} value={m.codigoItem}>
                        {m.codigoItem} - {m.descricao}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantidade de Massa (kg/g)
                  <input
                    type="number"
                    value={massaQuantidade}
                    onChange={(e) => setMassaQuantidade(e.target.value)}
                  />
                </label>
                <label>
                  Catalisador da Massa
                  <input
                    value={massaCatalisador}
                    onChange={(e) => setMassaCatalisador(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Lote da massa
                  <input
                    value={massaLote}
                    onChange={(e) => setMassaLote(e.target.value)}
                  />
                </label>
                <label>
                  Data de validade da massa
                  <input
                    type="date"
                    value={massaValidade}
                    onChange={(e) => setMassaValidade(e.target.value)}
                  />
                </label>
              </div>

              <hr style={{ borderColor: "#1f2937", margin: "16px 0" }} />

              <h3 className="section-title">Núcleo</h3>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Núcleo</h3>
              <div className="form-row">
                <label>
                  Núcleo
                  <select
                    value={nucleoTipo}
                    onChange={(e) => setNucleoTipo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    <option value="Espuma PVC">Espuma PVC</option>
                    <option value="Espuma PET">Espuma PET</option>
                    <option value="Madeira Balsa">Madeira Balsa</option>
                  </select>
                </label>
                <label>
                  Tipo do núcleo
                  <select
                    value={nucleoTipoNucleo}
                    onChange={(e) => setNucleoTipoNucleo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    <option value="Rígida">Rígida</option>
                    <option value="Flexível">Flexível</option>
                  </select>
                </label>
                <label>
                  Espessura do Núcleo (mm)
                  <input
                    type="number"
                    value={nucleoEspessura}
                    onChange={(e) => setNucleoEspessura(e.target.value)}
                  />
                </label>
              </div>

              <hr style={{ borderColor: "#1f2937", margin: "16px 0" }} />

              <h3 className="section-title">Massa PU (Filler)</h3>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Massa PU (Filler)</h3>
              <div className="form-row">
                <label>
                  Massa PU (Filler)
                  <select
                    value={puTipo}
                    onChange={(e) => setPuTipo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    {opcoesEstoquePorCategoria(
                      projetoMedicao || "",
                      ["pu", "poliuretano", "filler"],
                    ).map((m) => (
                      <option key={`pu-${m.id}`} value={m.codigoItem}>
                        {m.codigoItem} - {m.descricao}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Peso da massa PU
                  <input
                    type="number"
                    value={puMassaPeso}
                    onChange={(e) => setPuMassaPeso(e.target.value)}
                  />
                </label>
                <label>
                  Peso do catalisador do PU
                  <input
                    type="number"
                    value={puCatalisadorPeso}
                    onChange={(e) => setPuCatalisadorPeso(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Lote do PU
                  <input
                    value={puLote}
                    onChange={(e) => setPuLote(e.target.value)}
                  />
                </label>
                <label>
                  Data de validade do PU
                  <input
                    type="date"
                    value={puValidade}
                    onChange={(e) => setPuValidade(e.target.value)}
                  />
                </label>
              </div>

              <hr style={{ borderColor: "#1f2937", margin: "16px 0" }} />

              <h3 className="section-title">Gel</h3>
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>Gel</h3>
              <div className="form-row">
                <label>
                  Gel
                  <select
                    value={gelTipo}
                    onChange={(e) => setGelTipo(e.target.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      width: "100%",
                      background: "#ffffff",
                      color: "#1f2937",
                    }}
                  >
                    <option value="">Selecione...</option>
                    {opcoesFixasComStatus(projetoMedicao || "", LISTA_GEL).map((o) => (
                      <option
                        key={`gel-${o.descricao}`}
                        value={o.codigoItem || ""}
                        disabled={!o.encontrado}
                      >
                        {o.descricao}
                        {!o.encontrado ? " (não encontrado no estoque)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Peso do gel
                  <input
                    type="number"
                    value={gelPeso}
                    onChange={(e) => setGelPeso(e.target.value)}
                  />
                </label>
                <label>
                  Peso do catalisador do gel
                  <input
                    type="number"
                    value={gelCatalisadorPeso}
                    onChange={(e) => setGelCatalisadorPeso(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Lote do gel
                  <input
                    value={gelLote}
                    onChange={(e) => setGelLote(e.target.value)}
                  />
                </label>
                <label>
                  Data de validade do gel
                  <input
                    type="date"
                    value={gelValidade}
                    onChange={(e) => setGelValidade(e.target.value)}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  <span>É retrabalho?</span>
                  <select
                    value={retrabalho}
                    onChange={(e) =>
                      setRetrabalho(e.target.value as "Sim" | "Não" | "")
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </label>
              </div>

          <button 
            type="submit" 
            className="primary-button"
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
              marginTop: "8px",
            }}
          >
            Registrar medição
          </button>
        </form>
      </section>
        </>
      )}
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


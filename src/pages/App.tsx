import { useEffect, useState } from "react";
import axios from "axios";

type Material = {
  id: number;
  codigoItem: string;
  descricao: string;
  unidade: string;
  estoqueInicial: number;
  estoqueAtual: number;
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
};

// Backend principal do portal roda na porta 4001 (para não conflitar com o servidor de passagens).
const API_BASE_URL = "http://localhost:4001";

export function App() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

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

  const [medicoes, setMedicoes] = useState<MedicaoGrid[]>([]);
  const [aba, setAba] = useState<"apontamento" | "materiais">("apontamento");
  const [modulo, setModulo] = useState<"home" | "materiais" | "passagens">(
    "home",
  );

  // Função removida - agora Passagens é integrado no portal

  const qtdEventosNumero =
    !qtdEventos || qtdEventos === "Nenhuma" ? 0 : Number(qtdEventos);
  const [mostrarCamposAvancados, setMostrarCamposAvancados] = useState(false);

  useEffect(() => {
    carregarMateriais();
    carregarMedicoes();
  }, []);

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
      }));
      setMedicoes(linhas);
    } catch (e) {
      console.error(e);
    }
  }

  async function registrarMedicao(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/medicoes`, {
        codigoItem: codigoItemMedicao,
        quantidadeConsumida: Number(quantidadeMedida),
        projeto: projetoMedicao || "PROJETO-TESTE",
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
        resinaTipo,
        resinaQuantidade: resinaQuantidade
          ? Number(resinaQuantidade)
          : null,
        resinaCatalisador,
        resinaLote,
        resinaValidade,
        massaTipo,
        massaQuantidade: massaQuantidade ? Number(massaQuantidade) : null,
        massaCatalisador,
        massaLote,
        massaValidade,
        nucleoTipo,
        nucleoEspessuraMm: nucleoEspessura ? Number(nucleoEspessura) : null,
        puTipo,
        puMassaPeso: puMassaPeso ? Number(puMassaPeso) : null,
        puCatalisadorPeso: puCatalisadorPeso
          ? Number(puCatalisadorPeso)
          : null,
        puLote,
        puValidade,
        gelTipo,
        gelPeso: gelPeso ? Number(gelPeso) : null,
        gelCatalisadorPeso: gelCatalisadorPeso
          ? Number(gelCatalisadorPeso)
          : null,
        gelLote,
        gelValidade,
        retrabalho: retrabalho === "Sim",
      });

      setCodigoItemMedicao("");
      setQuantidadeMedida("0");
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

  // Espera que o usuário cole linhas do Excel com colunas:
  // codigoItem;descricao;unidade;estoqueInicial
  async function importarMateriais(e: React.FormEvent) {
    e.preventDefault();

    if (!textoImportacao.trim()) {
      return;
    }

    const linhas = textoImportacao
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const itens = linhas.map((linha) => {
      // aceita tanto ; quanto tab como separador
      const partes = linha.split(/[\t;]+/);
      const [codigo, desc, unid, estoqueStr] = partes;
      return {
        codigoItem: codigo?.trim(),
        descricao: desc?.trim(),
        unidade: (unid || "KG").trim(),
        estoqueInicial: estoqueStr ? Number(estoqueStr.replace(",", ".")) : 0,
      };
    });

    try {
      await axios.post(`${API_BASE_URL}/materiais/import`, { itens });
      setMensagemImportacao(
        `Importação concluída. Linhas processadas: ${itens.length}.`,
      );
      setTextoImportacao("");
      await carregarMateriais();
    } catch (e) {
      console.error(e);
      setErro("Erro ao importar materiais.");
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
            }}
          >
            {/* Passagens à esquerda */}
            <button
              type="button"
              className="primary-button"
              style={{
                width: "100%",
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
                padding: "18px 20px",
                borderRadius: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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
        <h2>Materiais cadastrados</h2>
        {loading && <p>Carregando...</p>}
        {erro && <p className="error">{erro}</p>}
        {!loading && materiais.length === 0 && <p>Nenhum material cadastrado.</p>}

        {materiais.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Nº do item</th>
                <th>Descrição</th>
                <th>Unidade</th>
                <th>Estoque inicial</th>
                <th>Estoque atual</th>
              </tr>
            </thead>
            <tbody>
              {materiais.map((m) => (
                <tr key={m.id}>
                  <td>{m.codigoItem}</td>
                  <td>{m.descricao}</td>
                  <td>{m.unidade}</td>
                  <td>{m.estoqueInicial}</td>
                  <td>{m.estoqueAtual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
        {mensagemImportacao && (
          <p style={{ marginTop: 8, fontSize: 14, color: "#16a34a" }}>
            {mensagemImportacao}
          </p>
        )}
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

          {!mostrarCamposAvancados && (
            <button
              type="button"
              className="primary-button"
              style={{ marginTop: 8 }}
              onClick={() => setMostrarCamposAvancados(true)}
            >
              Ver mais campos (igual ao Smartsheet)
            </button>
          )}

          {mostrarCamposAvancados && (
            <>
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
                  <input
                    value={resinaTipo}
                    onChange={(e) => setResinaTipo(e.target.value)}
                  />
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
                  <input
                    value={massaTipo}
                    onChange={(e) => setMassaTipo(e.target.value)}
                  />
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
                  <input
                    value={nucleoTipo}
                    onChange={(e) => setNucleoTipo(e.target.value)}
                  />
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
                  <input
                    value={puTipo}
                    onChange={(e) => setPuTipo(e.target.value)}
                  />
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
                  <input
                    value={gelTipo}
                    onChange={(e) => setGelTipo(e.target.value)}
                  />
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

          {/* Bloco final para envio da medição / consumo de material */}
          <hr style={{ borderColor: "#e5e7eb", margin: "24px 0", borderWidth: "1px" }} />
          <div className="form-row">
            <label>
              <span>Nº do item (código do estoque) *</span>
              <input
                value={codigoItemMedicao}
                onChange={(e) => setCodigoItemMedicao(e.target.value)}
                required
              />
            </label>
            <label>
              <span>Quantidade consumida (sai do estoque) *</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantidadeMedida}
                onChange={(e) => setQuantidadeMedida(e.target.value)}
                required
              />
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
            </>
          )}
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


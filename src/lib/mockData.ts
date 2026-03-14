// Mock data for the application

export interface Client {
  id: string;
  name: string;
  is_active: boolean;
  keywords: string[];
  created_at: string;
}

export interface ScanItem {
  id: string;
  original_filename: string;
  status: 'pending' | 'ocr_processing' | 'nlp_processing' | 'completed' | 'error';
  uploaded_at: string;
  uploaded_by: string;
}

export interface Clip {
  id: string;
  scan_id: string;
  client_name: string;
  extracted_text_snippet: string;
  publication: string;
  page_number: number;
  column_cm2: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  date: string;
  verified: boolean;
}

export const mockClients: Client[] = [
  { id: "1", name: "Petrobras", is_active: true, keywords: ["petróleo", "pré-sal", "combustível"], created_at: "2026-01-15" },
  { id: "2", name: "Banco do Brasil", is_active: true, keywords: ["crédito", "banco", "financeiro"], created_at: "2026-01-20" },
  { id: "3", name: "Embraer", is_active: true, keywords: ["aviação", "aeronave", "defesa"], created_at: "2026-02-01" },
  { id: "4", name: "Vale S.A.", is_active: false, keywords: ["mineração", "minério", "ferro"], created_at: "2026-02-10" },
  { id: "5", name: "Magazine Luiza", is_active: true, keywords: ["varejo", "e-commerce", "marketplace"], created_at: "2026-03-01" },
];

export const mockScans: ScanItem[] = [
  { id: "s1", original_filename: "folha_sp_14mar_p1.jpg", status: "completed", uploaded_at: "2026-03-14 08:30", uploaded_by: "Ana Silva" },
  { id: "s2", original_filename: "folha_sp_14mar_p2.jpg", status: "completed", uploaded_at: "2026-03-14 08:30", uploaded_by: "Ana Silva" },
  { id: "s3", original_filename: "oglobo_14mar_p5.jpg", status: "nlp_processing", uploaded_at: "2026-03-14 09:15", uploaded_by: "Carlos Mota" },
  { id: "s4", original_filename: "oglobo_14mar_p6.jpg", status: "ocr_processing", uploaded_at: "2026-03-14 09:16", uploaded_by: "Carlos Mota" },
  { id: "s5", original_filename: "estadao_14mar_p1.jpg", status: "pending", uploaded_at: "2026-03-14 10:00", uploaded_by: "Ana Silva" },
  { id: "s6", original_filename: "estadao_14mar_p3.jpg", status: "pending", uploaded_at: "2026-03-14 10:01", uploaded_by: "Ana Silva" },
  { id: "s7", original_filename: "veja_ed2890_p22.jpg", status: "error", uploaded_at: "2026-03-13 14:20", uploaded_by: "Carlos Mota" },
];

export const mockClips: Clip[] = [
  { id: "c1", scan_id: "s1", client_name: "Petrobras", extracted_text_snippet: "A Petrobras anunciou investimento recorde de R$ 102 bilhões para exploração do pré-sal no litoral do Rio de Janeiro, marcando nova fase...", publication: "Folha de S.Paulo", page_number: 1, column_cm2: 245, sentiment: "positive", date: "2026-03-14", verified: true },
  { id: "c2", scan_id: "s1", client_name: "Banco do Brasil", extracted_text_snippet: "O Banco do Brasil registrou queda de 3% no lucro líquido do trimestre, segundo relatório divulgado ontem à noite pela instituição...", publication: "Folha de S.Paulo", page_number: 1, column_cm2: 180, sentiment: "negative", date: "2026-03-14", verified: true },
  { id: "c3", scan_id: "s2", client_name: "Embraer", extracted_text_snippet: "Embraer assina contrato de US$ 600 milhões para fornecimento de jatos C-390 à Força Aérea da Suécia, consolidando presença no mercado europeu...", publication: "Folha de S.Paulo", page_number: 4, column_cm2: 310, sentiment: "positive", date: "2026-03-14", verified: false },
  { id: "c4", scan_id: "s2", client_name: "Magazine Luiza", extracted_text_snippet: "Magazine Luiza anuncia parcerias com sellers internacionais para expandir catálogo de produtos importados no marketplace...", publication: "Folha de S.Paulo", page_number: 8, column_cm2: 145, sentiment: "neutral", date: "2026-03-14", verified: false },
  { id: "c5", scan_id: "s1", client_name: "Petrobras", extracted_text_snippet: "Governo federal discute revisão de royalties do pré-sal com estados produtores, gerando incerteza sobre receitas futuras da Petrobras...", publication: "O Globo", page_number: 5, column_cm2: 200, sentiment: "negative", date: "2026-03-13", verified: true },
  { id: "c6", scan_id: "s2", client_name: "Embraer", extracted_text_snippet: "Embraer registra entrega recorde de 75 aeronaves no primeiro trimestre de 2026, superando previsões do mercado...", publication: "O Estado de S.Paulo", page_number: 12, column_cm2: 190, sentiment: "positive", date: "2026-03-13", verified: true },
  { id: "c7", scan_id: "s1", client_name: "Banco do Brasil", extracted_text_snippet: "Banco do Brasil mantém liderança no crédito consignado com participação de mercado de 23,4% segundo dados do Banco Central...", publication: "Valor Econômico", page_number: 3, column_cm2: 165, sentiment: "neutral", date: "2026-03-12", verified: true },
  { id: "c8", scan_id: "s2", client_name: "Magazine Luiza", extracted_text_snippet: "Ações da Magazine Luiza sobem 8% após divulgação de resultado trimestral acima do esperado pelo consenso de mercado...", publication: "Valor Econômico", page_number: 7, column_cm2: 130, sentiment: "positive", date: "2026-03-12", verified: false },
];

export const dashboardStats = {
  total_clips: 1247,
  clips_today: 12,
  clips_week: 89,
  active_queue: 4,
  total_processed: 342,
  clients_active: 4,
  sentiment_breakdown: {
    positive: 45,
    neutral: 35,
    negative: 20,
  },
  volume_by_day: [
    { day: "Seg", clips: 18 },
    { day: "Ter", clips: 24 },
    { day: "Qua", clips: 15 },
    { day: "Qui", clips: 31 },
    { day: "Sex", clips: 22 },
    { day: "Sáb", clips: 8 },
    { day: "Dom", clips: 3 },
  ],
};

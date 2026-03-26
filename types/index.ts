export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export interface TaskData {
  origem_validada: string;
  destino_validado: string;
  titulo_resumo: string;
  lista_compras: string[];
  valor_estimado_itens: number;
  orientacoes_prestador: string;
  categoria: 'compras' | 'entrega' | 'servico' | 'outros';
  distancia_km?: number;
  valor_entrega?: number;
  tipo_favor?: 'coleta' | 'compra' | 'fazer_proposta';
  origin_coords?: { lat: number; lng: number };
  destination_coords?: { lat: number; lng: number };
}

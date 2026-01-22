import { FormGroup } from '@angular/forms';
import { IResult } from '../models/common.models';

/**
 * Define o contrato para qualquer "aba" (como Seguro, Resseguro) no sistema.
 * Esta classe abstrata descreve uma aba como uma detentora de configuração e uma
 * coletora de resultados. O SusepService atua como o orquestrador principal que
 * executa a lógica de busca e entrega os resultados para a aba.
 */
export abstract class BaseTabComponent {
    /**
     * A identidade única da aba (ex: 'seguro', 'resseguro').
     * Usado pelo SusepService para construir os endpoints da API.
     */
    abstract readonly type: string;

    /**
     * A propriedade que armazena a coleção de resultados brutos da API.
     * O SusepService comanda a busca e usa o método 'addResult' para popular
     * este array. Ao final do processo, o serviço lê esta propriedade para
     * transformar os dados para o relatório final.
     */
    abstract readonly results: IResult[];

    /**
     * O formulário Angular que contém os parâmetros de entrada para esta aba.
     * O SusepService lê os valores deste formulário para conduzir a busca.
     */
    abstract readonly form: FormGroup;

    /**
     * Chamado pelo SusepService a cada iteração do loop de busca de dados.
     * A responsabilidade da aba é simplesmente receber o resultado de um mês
     * e adicioná-lo à sua propriedade interna 'results'.
     * @param result O objeto de resultado para um único mês, retornado pela API.
     */
    abstract addResult(result: IResult): void;
        
    /**
     * Chamado pelo SusepService para entregar à aba os dados que ela precisa para
     * popular seus próprios controles (ex: as listas para os dropdowns).
     * @param data Um objeto contendo os dados que o SusepService buscou para esta aba.
     */
    abstract initialize(data: any): void;
}

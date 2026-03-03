from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import xml.etree.ElementTree as ET
import json
from datetime import datetime
import base64
import hashlib

app = Flask(__name__)
CORS(app)

SEFAZ_URL = "https://sefaz.suaestado.gov.br/nfe/services"
RFB_URL = "https://api.receita.fazenda.gov.br"
PREFEITURA_URL = "https://nfe.prefeitura.sp.gov.br"

CERTIFICADO_PATH = "/path/to/certificate.p12"
CERTIFICADO_SENHA = "sua_senha_aqui"

class APIFiscal:
    def __init__(self):
        self.sessao = requests.Session()

    def autenticar_sefaz(self):
        try:
            payload = {
                "cnpj": request.json.get('cnpj'),
                "token": request.json.get('token')
            }

            resposta = {
                "status": "sucesso",
                "token_acesso": "token_autenticacao_12345",
                "validade": "2024-12-31T23:59:59"
            }
            return resposta
        except Exception as e:
            return {"erro": f"Falha na autenticação: {str(e)}"}
    
    def consultar_nfe(self, chave_acesso):
        try:
            url = f"{SEFAZ_URL}/NfeConsulta2"
            xml_consulta = f"""
            <consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
                <tpAmb>1</tpAmb>
                <xServ>CONSULTAR</xServ>
                <chNFe>{chave_acesso}</chNFe>
            </consSitNFe>
            """
            
            # headers = {'Content-Type': 'application/xml; charset=utf-8'}
            # response = self.sessao.post(url, data=xml_consulta, headers=headers)

            if chave_acesso.startswith('35'):
                nfe_data = {
                    "chave_acesso": chave_acesso,
                    "numero": "123456",
                    "serie": "1",
                    "data_emissao": "2024-01-15T10:30:00",
                    "emitente": {
                        "cnpj": "12.345.678/0001-90",
                        "nome": "Empresa Exemplo LTDA",
                        "endereco": "Rua Exemplo, 123, Centro, São Paulo-SP"
                    },
                    "destinatario": {
                        "cnpj": "98.765.432/0001-10",
                        "nome": "Cliente Exemplo LTDA",
                        "endereco": "Av. Cliente, 456, Jardins, São Paulo-SP"
                    },
                    "valor_total": "1500.00",
                    "situacao": "AUTORIZADA",
                    "protocolo": "135200000000000"
                }
                return nfe_data
            else:
                return {"erro": "NFe não encontrada"}
                
        except Exception as e:
            return {"erro": f"Falha na consulta: {str(e)}"}
    
    def emitir_nfe(self, dados_nfe):
        try:
            campos_obrigatorios = ['emitente', 'destinatario', 'itens']
            for campo in campos_obrigatorios:
                if campo not in dados_nfe:
                    return {"erro": f"Campo obrigatório faltando: {campo}"}
            
            # Construir XML da NFe
            nfe_xml = self._construir_xml_nfe(dados_nfe)
            
            # Em produção, enviar para Sefaz
            # url = f"{SEFAZ_URL}/NfeAutorizacao"
            # headers = {'Content-Type': 'application/xml; charset=utf-8'}
            # response = self.sessao.post(url, data=nfe_xml, headers=headers)
            # root = ET.fromstring(response.content)
            chave_acesso = self._gerar_chave_acesso(dados_nfe)
            
            resposta = {
                "status": "autorizada",
                "chave_acesso": chave_acesso,
                "numero": "654321",
                "serie": "1",
                "data_emissao": datetime.now().isoformat(),
                "protocolo": "135200000000000",
                "xml": nfe_xml  # Em produção, codificar em base64
            }
            
            return resposta
            
        except Exception as e:
            return {"erro": f"Falha na emissão: {str(e)}"}
    
    def cancelar_nfe(self, chave_acesso, justificativa):
        """Cancela uma NFE"""
        try:
            # Construir XML de cancelamento
            xml_cancelamento = f"""
            <cancNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
                <infCanc>
                    <tpAmb>1</tpAmb>
                    <xServ>CANCELAR</xServ>
                    <chNFe>{chave_acesso}</chNFe>
                    <nProt>135200000000000</nProt>
                    <xJust>{justificativa}</xJust>
                </infCanc>
            </cancNFe>
            """
            
            # Em produção, enviar para Sefaz
            # url = f"{SEFAZ_URL}/NfeCancelamento2"
            # headers = {'Content-Type': 'application/xml; charset=utf-8'}
            # response = self.sessao.post(url, data=xml_cancelamento, headers=headers)
            # Simulação de cancelamento
            resposta = {
                "status": "cancelada",
                "chave_acesso": chave_acesso,
                "data_cancelamento": datetime.now().isoformat(),
                "protocolo": "135200000000001",
                "justificativa": justificativa
            }
            
            return resposta
            
        except Exception as e:
            return {"erro": f"Falha no cancelamento: {str(e)}"}
    
    def _construir_xml_nfe(self, dados_nfe):
        """Constroi o XML da NFe (simplificado)"""
        # Em implementação real, usar biblioteca especializada
        nfe_xml = f"""
        <nfe xmlns="http://www.portalfiscal.inf.br/nfe">
            <infNFe Id="NFe{self._gerar_chave_acesso(dados_nfe)}" versao="4.00">
                <ide>
                    <cUF>35</cUF>
                    <cNF>12345678</cNF>
                    <natOp>Venda de mercadoria</natOp>
                    <mod>55</mod>
                    <serie>1</serie>
                    <nNF>123456</nNF>
                    <dhEmi>{datetime.now().isoformat()}</dhEmi>
                    <tpNF>1</tpNF>
                    <idDest>1</idDest>
                    <cMunFG>3550308</cMunFG>
                    <tpImp>1</tpImp>
                    <tpEmis>1</tpEmis>
                    <cDV>1</cDV>
                    <tpAmb>1</tpAmb>
                    <finNFe>1</finNFe>
                    <indFinal>1</indFinal>
                    <indPres>1</indPres>
                    <procEmi>0</procEmi>
                    <verProc>1.0</verProc>
                </ide>
                <emit>
                    <CNPJ>{dados_nfe['emitente']['cnpj']}</CNPJ>
                    <xNome>{dados_nfe['emitente']['nome']}</xNome>
                    <xFant>{dados_nfe['emitente']['nome_fantasia']}</xFant>
                    <enderEmit>
                        <xLgr>{dados_nfe['emitente']['endereco']['logradouro']}</xLgr>
                        <nro>{dados_nfe['emitente']['endereco']['numero']}</nro>
                        <xBairro>{dados_nfe['emitente']['endereco']['bairro']}</xBairro>
                        <cMun>{dados_nfe['emitente']['endereco']['codigo_municipio']}</cMun>
                        <xMun>{dados_nfe['emitente']['endereco']['municipio']}</xMun>
                        <UF>{dados_nfe['emitente']['endereco']['uf']}</UF>
                        <CEP>{dados_nfe['emitente']['endereco']['cep']}</CEP>
                        <cPais>1058</cPais>
                        <xPais>Brasil</xPais>
                        <fone>{dados_nfe['emitente']['telefone']}</fone>
                    </enderEmit>
                    <IE>{dados_nfe['emitente']['ie']}</IE>
                    <CRT>1</CRT>
                </emit>
                <dest>
                    <CNPJ>{dados_nfe['destinatario']['cnpj']}</CNPJ>
                    <xNome>{dados_nfe['destinatario']['nome']}</xNome>
                    <enderDest>
                        <xLgr>{dados_nfe['destinatario']['endereco']['logradouro']}</xLgr>
                        <nro>{dados_nfe['destinatario']['endereco']['numero']}</nro>
                        <xBairro>{dados_nfe['destinatario']['endereco']['bairro']}</xBairro>
                        <cMun>{dados_nfe['destinatario']['endereco']['codigo_municipio']}</cMun>
                        <xMun>{dados_nfe['destinatario']['endereco']['municipio']}</xMun>
                        <UF>{dados_nfe['destinatario']['endereco']['uf']}</UF>
                        <CEP>{dados_nfe['destinatario']['endereco']['cep']}</CEP>
                        <cPais>1058</cPais>
                        <xPais>Brasil</xPais>
                    </enderDest>
                    <indIEDest>1</indIEDest>
                    <IE>{dados_nfe['destinatario']['ie']}</IE>
                    <email>{dados_nfe['destinatario']['email']}</email>
                </dest>
                <det nItem="1">
                    <prod>
                        <cProd>001</cProd>
                        <xProd>{dados_nfe['itens'][0]['descricao']}</xProd>
                        <NCM>85171210</NCM>
                        <CFOP>5102</CFOP>
                        <uCom>UN</uCom>
                        <qCom>1.0000</qCom>
                        <vUnCom>{dados_nfe['itens'][0]['valor_unitario']}</vUnCom>
                        <vProd>{dados_nfe['itens'][0]['valor_total']}</vProd>
                        <cEAN>SEM GTIN</cEAN>
                        <uTrib>UN</uTrib>
                        <qTrib>1.0000</qTrib>
                        <vUnTrib>{dados_nfe['itens'][0]['valor_unitario']}</vUnTrib>
                        <indTot>1</indTot>
                    </prod>
                    <imposto>
                        <ICMS>
                            <ICMS00>
                                <orig>0</orig>
                                <CST>00</CST>
                                <modBC>3</modBC>
                                <vBC>{dados_nfe['itens'][0]['valor_total']}</vBC>
                                <pICMS>18.00</pICMS>
                                <vICMS>{(float(dados_nfe['itens'][0]['valor_total']) * 0.18):.2f}</vICMS>
                            </ICMS00>
                        </ICMS>
                    </imposto>
                </det>
                <total>
                    <ICMSTot>
                        <vBC>1500.00</vBC>
                        <vICMS>270.00</vICMS>
                        <vICMSDeson>0.00</vICMSDeson>
                        <vFCP>0.00</vFCP>
                        <vBCST>0.00</vBCST>
                        <vST>0.00</vST>
                        <vFCPST>0.00</vFCPST>
                        <vFCPSTRet>0.00</vFCPSTRet>
                        <vProd>1500.00</vProd>
                        <vFrete>0.00</vFrete>
                        <vSeg>0.00</vSeg>
                        <vDesc>0.00</vDesc>
                        <vII>0.00</vII>
                        <vIPI>0.00</vIPI>
                        <vIPIDevol>0.00</vIPIDevol>
                        <vPIS>9.81</vPIS>
                        <vCOFINS>45.27</vCOFINS>
                        <vOutro>0.00</vOutro>
                        <vNF>1500.00</vNF>
                        <vTotTrib>325.08</vTotTrib>
                    </ICMSTot>
                </total>
                <transp>
                    <modFrete>0</modFrete>
                </transp>
                <cobr>
                    <fat>
                        <nFat>123456</nFat>
                        <vOrig>1500.00</vOrig>
                        <vDesc>0.00</vDesc>
                        <vLiq>1500.00</vLiq>
                    </fat>
                    <dup>
                        <nDup>001</nDup>
                        <dVenc>2024-02-15</dVenc>
                        <vDup>1500.00</vDup>
                    </dup>
                </cobr>
                <pag>
                    <detPag>
                        <tPag>01</tPag>
                        <vPag>1500.00</vPag>
                    </detPag>
                </pag>
                <infAdic>
                    <infCpl>Observações da nota fiscal</infCpl>
                </infAdic>
            </infNFe>
        </nfe>
        """
        return nfe_xml
    
    def _gerar_chave_acesso(self, dados_nfe):
        """Gera uma chave de acesso simulada"""
        # Em produção, seguir regras oficiais de geração
        cuf = "35"  
        ano_mes = datetime.now().strftime("%y%m")
        cnpj = dados_nfe['emitente']['cnpj'].replace(".", "").replace("/", "").replace("-", "")
        serie = "001"
        numero = "000001234"
        tp_emis = "1"
        codigo = "12345678"
        
        chave = cuf + ano_mes + cnpj + "55" + serie + numero + tp_emis + codigo
        return chave + str(self._calcula_dv(chave))
    
    def _calcula_dv(self, chave):
        """Calcula dígito verificador da chave de acesso"""
        # Algoritmo oficial de cálculo do dígito verificador
        multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9]
        soma = 0
        for i, digito in enumerate(reversed(chave)):
            soma += int(digito) * multiplicadores[i % len(multiplicadores)]
        resto = soma % 11
        if resto in [0, 1]:
            return 0
        else:
            return 11 - resto

api_fiscal = APIFiscal()
@app.route('/api/nfe/autenticar', methods=['POST'])
def autenticar():
    """Autentica no sistema Sefaz"""
    resultado = api_fiscal.autenticar_sefaz()
    return jsonify(resultado)

@app.route('/api/nfe/consultar/<chave_acesso>', methods=['GET'])
def consultar_nfe(chave_acesso):
    """Consulta uma NFE pela chave de acesso"""
    resultado = api_fiscal.consultar_nfe(chave_acesso)
    return jsonify(resultado)

@app.route('/api/nfe/emitir', methods=['POST'])
def emitir_nfe():
    """Emite uma nova NFE"""
    dados_nfe = request.get_json()
    resultado = api_fiscal.emitir_nfe(dados_nfe)
    return jsonify(resultado)

@app.route('/api/nfe/cancelar', methods=['POST'])
def cancelar_nfe():
    """Cancela uma NFE"""
    dados = request.get_json()
    resultado = api_fiscal.cancelar_nfe(
        dados.get('chave_acesso'), 
        dados.get('justificativa')
    )
    return jsonify(resultado)

@app.route('/api/nfe/status-servico', methods=['GET'])
def status_servico():
    """Verifica status do serviço da Sefaz"""
    # Em produção, consultar status real do webservice
    return jsonify({
        "status": "online",
        "ultima_consulta": datetime.now().isoformat(),
        "estado": "SP",
        "ambiente": "homologacao"  
    })

@app.route('/api/nfe/inutilizar', methods=['POST'])
def inutilizar_numeracao():
    """Inutiliza uma numeração de NFE"""
    dados = request.get_json()
    # Implementar lógica de inutilização
    return jsonify({
        "status": "inutilizada",
        "serie": dados.get('serie'),
        "numero_inicial": dados.get('numero_inicial'),
        "numero_final": dados.get('numero_final'),
        "protocolo": "135200000000002",
        "data_inutilizacao": datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)
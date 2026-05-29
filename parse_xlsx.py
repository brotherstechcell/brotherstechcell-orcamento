import zipfile
import xml.etree.ElementTree as ET
import json

def get_shared_strings(z):
    try:
        xml_content = z.read('xl/sharedStrings.xml')
        root = ET.fromstring(xml_content)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        return [t.text for t in root.findall('.//ns:t', ns)]
    except KeyError:
        return []

def parse_sheet(z, shared_strings):
    xml_content = z.read('xl/worksheets/sheet1.xml')
    root = ET.fromstring(xml_content)
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    
    rows = []
    for row in root.findall('.//ns:row', ns):
        row_data = {}
        for c in row.findall('ns:c', ns):
            cell_ref = c.get('r')
            cell_type = c.get('t')
            val_el = c.find('ns:v', ns)
            if val_el is not None:
                val = val_el.text
                if cell_type == 's':
                    val = shared_strings[int(val)]
                # extract column letter
                col = "".join(filter(str.isalpha, cell_ref))
                row_data[col] = val
        if row_data:
            rows.append(row_data)
    return rows

with zipfile.ZipFile('precos_servicos_Brothers_Techcell_IA.xlsx') as z:
    strings = get_shared_strings(z)
    rows = parse_sheet(z, strings)
    
    # Structure:
    # {
    #   "iPhone 11": {
    #      "tela": { "Básica": { "price": "X", "installment": "Y" }, ... },
    #      "bateria": { ... }
    #   }
    # }
    data = {}
    
    # Skip header
    for r in rows[1:]:
        model = r.get('A')
        service = r.get('B')
        quality = r.get('C')
        price_cash = r.get('D')
        price_install = r.get('E')
        
        if not model or not service:
            continue
            
        # Clean service and quality names
        service = service.strip()
        quality = quality.strip()
        
        # We only care about "tela" and "bateria" for the selector
        if service not in ['tela', 'bateria']:
            continue
            
        if model not in data:
            data[model] = {
                "tela": {},
                "bateria": {}
            }
            
        # Format prices to look neat (e.g. 599.9 -> "599,90" or "600,00" or as strings)
        try:
            val_cash = float(price_cash)
            formatted_cash = "{:,.2f}".format(val_cash).replace(",", "X").replace(".", ",").replace("X", ".")
        except (ValueError, TypeError):
            formatted_cash = str(price_cash)
            
        try:
            val_install = float(price_install)
            formatted_install = "12x de R$ {:,.2f}".format(val_install).replace(",", "X").replace(".", ",").replace("X", ".")
        except (ValueError, TypeError):
            formatted_install = f"12x de {price_install}" if price_install else ""
            
        data[model][service][quality] = {
            "price": formatted_cash,
            "installment": formatted_install
        }
        
    # Let's generate a beautiful javascript config
    js_content = """/**
 * CONFIGURAÇÃO DE PREÇOS E CONTATOS - BROTHERS TECHCELL
 * 
 * Este arquivo foi gerado automaticamente a partir da planilha de preços.
 * Altere os valores abaixo de forma simples para atualizar o site inteiro.
 */

const CONFIG = {
  // Informações de Contato da Brothers Techcell
  contact: {
    phone: "(92) 99395-1193",
    phoneRaw: "5592993951193", // Apenas números, com DDI (55) + DDD (92)
    email: "contato@brotherstechcell.com.br",
    instagram: "brotherstechcell",
    instagramUrl: "https://www.instagram.com/brotherstechcell/",
    cnpj: "42.189.654/0001-90",
    city: "Manaus",
    address: "Manaus - AM (Atendimento Delivery)",
  },

  warranty: "3 meses de garantia real",
  paymentTerms: "Em até 12x no cartão",

  // Dados de preços agrupados por modelo para o seletor único
  devices: """ + json.dumps(data, indent=2, ensure_ascii=False) + """
};
"""
    
    with open('js/prices.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print("Preços importados com sucesso para js/prices.js! Total de modelos:", len(data))

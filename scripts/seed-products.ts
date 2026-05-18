import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(url, key)

const PRODUCTS: { name: string; unit_label: string; min_stock_alert: number; codigo_havanna: string }[] = [
  // ALFAJORES Y GALLETITAS POR CAJA
  { name: 'Alfajor mixto caja x12',             unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1' },
  { name: 'Alfajor choc caja x12',              unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '9' },
  { name: 'Havannet choc caja x12',             unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '21' },
  { name: 'Alfajor 70 cacao caja x9',           unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '25' },
  { name: 'Galletita limón caja x12',           unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '33' },
  { name: 'Galletita choc limón caja x12',      unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '36' },
  { name: 'Alfajor mixto caja x6',              unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '37' },
  { name: 'Alfajor choc caja x6',               unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '50' },
  { name: 'Alfajor Super DDL x9',               unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '71' },
  { name: 'Alfajor Semilia 70 cacao caja x9',   unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '78' },
  { name: 'Alfajor choc blanco nuez caja x6',   unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1208' },
  { name: 'Alfajor choc blanco nuez caja x12',  unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1215' },
  { name: 'Havannet 70 cacao caja x8',          unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1220' },
  { name: 'Havannet choc caja x6',              unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1224' },
  // ALFAJORES Y GALLETITAS POR UNIDAD
  { name: 'Alfajor merengue x un',              unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '601' },
  { name: 'Alfajor choc x un',                  unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '602' },
  { name: 'Alfajor merengue fruta x un',        unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '603' },
  { name: 'Alfajor choc blanco nuez x un',      unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '604' },
  { name: 'Havannet choc x un',                 unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '606' },
  { name: 'Alfajor 70 cacao x un',              unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '610' },
  { name: 'Galletita limón x un',               unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '611' },
  { name: 'Galletita choc limón x un',          unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '612' },
  { name: 'Havannet choc blanco x un',          unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '613' },
  { name: 'Alfajor choc blanco x un',           unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '639' },
  { name: 'Havannet 70 cacao x un',             unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '645' },
  { name: 'Alfajor semilia 70 cacao x un',      unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '664' },
  { name: 'Alfajor Super DDL x un',             unit_label: 'unidad', min_stock_alert: 10, codigo_havanna: '696' },
  // MEDALLONES Y BARRITAS
  { name: 'Medallon caja chica',                unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1187' },
  { name: 'Medallon choc caja chica',           unit_label: 'caja',   min_stock_alert: 5,  codigo_havanna: '1188' },
  { name: 'Medallon Semilia x2',                unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1190' },
  { name: 'Barrita cereal choc leche x un',     unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1195' },
  { name: 'Barrita cereal choc blanco x un',    unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1196' },
  { name: 'Barrita cereal 70 cacao x un',       unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1197' },
  // TABLETAS
  { name: 'Tableta choc x80g',                  unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2573' },
  { name: 'Tableta choc y almendras x80g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2574' },
  { name: 'Tableta choc y avellanas x80g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2575' },
  { name: 'Tableta semiamarga x80g',            unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2601' },
  { name: 'Tableta blanco x80g',                unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2602' },
  { name: 'Tableta 70 cacao x80g',              unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2603' },
  { name: 'Barrita choc submarino x un',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2608' },
  { name: 'Tableta chocolate con leche caja x30', unit_label: 'caja', min_stock_alert: 3,  codigo_havanna: '2650' },
  { name: 'Tableta choc blanco caja x30',       unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '2651' },
  { name: 'Tableta 70 cacao puro x30',          unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '2652' },
  // BOMBONES Y TRUFAS
  { name: 'Bombones choc x8',                   unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2566' },
  { name: 'Bombones choc x20',                  unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2567' },
  { name: 'Coronitas choc tripack',             unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2591' },
  { name: 'Miniaturas choc x261g',              unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2592' },
  { name: 'Coronitas surtidas caja x21',        unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '2604' },
  { name: 'Coronitas choc caja x7',             unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '2609' },
  { name: 'Trufas choc DDLL lata x200g',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2634' },
  { name: 'Trufas choc marroc lata x200g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2635' },
  { name: 'Trufas surtidas lata x200g',         unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2636' },
  // CUADRADITOS Y MUFFINS
  { name: 'Cuadradito coco con DDL x un',       unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '683' },
  { name: 'Muffin vainilla con DDL x un',       unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '686' },
  { name: 'Cuadradito pasta frola x un',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '690' },
  { name: 'Cuadradito brownie con nuez x un',   unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '694' },
  // MINI PRODUCTOS
  { name: 'Alfajor mini choc pouch x475g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3808' },
  { name: 'Alfajor mini choc pouch x125g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3811' },
  { name: 'Galletita limón pouch x400g',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3812' },
  { name: 'Medallon choc limón pouch x200g',    unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3813' },
  { name: 'Alfajor mini choc granel',           unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3814' },
  { name: 'Alfajor mini choc blanco granel',    unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3815' },
  { name: 'Havannet mini choc pouch x112g',     unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3822' },
  { name: 'Havannet mini choc x400g',           unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3823' },
  { name: 'Galletita mini choc limón pouch x450g', unit_label: 'unidad', min_stock_alert: 5, codigo_havanna: '3828' },
  { name: 'Pouch x475g Mini Mixtos',            unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '3833' },
  // DULCE DE LECHE
  { name: 'Dulce de leche vidrio x800g',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '534' },
  { name: 'Dulce de leche vidrio x450g',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '535' },
  { name: 'Mermelada 5kg frutos del bosque',    unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '682' },
  { name: 'Dulce de leche Original 1kg',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1689' },
  // INSUMOS DE COCINA
  { name: 'Edulcorante caja x400 sobres',       unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '745' },
  { name: 'Azúcar caja x800 sobres',            unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '746' },
  { name: 'Aceite Oliva x250ml Casalta',        unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '872' },
  { name: 'Aceto Clásico x250ml Casalta',       unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '873' },
  { name: 'Crema Chantipack x1L',               unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '878' },
  { name: 'Puré Durazno Naranja x1lt',          unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '986' },
  { name: 'Salsa de chocolate',                 unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '987' },
  { name: 'Pastillas café descafeinado x120',   unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '1706' },
  { name: 'Variegato Frutos del Bosque 4kg',    unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1841' },
  { name: 'Polvo tramontana para frappé caja 4kg', unit_label: 'caja', min_stock_alert: 3, codigo_havanna: '1842' },
  { name: 'Salsa Chocolate Blanco x1000g',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '1965' },
  { name: 'Polvo dulce de leche latte caja 4kg', unit_label: 'caja',  min_stock_alert: 3,  codigo_havanna: '1977' },
  { name: 'Variegato de Maracuyá 750g',         unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '2020' },
  { name: 'Concentrado Mora Remolacha y Miel x1lt', unit_label: 'unidad', min_stock_alert: 3, codigo_havanna: '2035' },
  { name: 'Concentrado Banana Espinaca y Miel x1lt', unit_label: 'unidad', min_stock_alert: 3, codigo_havanna: '2036' },
  { name: 'Café Grano Havanna 1kg',             unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2037' },
  { name: 'Salsa DDL x450g',                    unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '2045' },
  { name: 'Puré manzana, pera, limón y matcha x1lt', unit_label: 'unidad', min_stock_alert: 3, codigo_havanna: '2061' },
  { name: 'Puré frutilla, banana, acaí x1lt',  unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '2062' },
  // SYRUPS
  { name: 'Saborizante Syrup Nocciola L',       unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1872' },
  { name: 'Saborizante Syrup Amaretto L',       unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1873' },
  { name: 'Saborizante Syrup Vainilla L',       unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1874' },
  { name: 'Saborizante Syrup Caramel L',        unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1875' },
  { name: 'Saborizante Syrup Limón L',          unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '1983' },
  // INFUSIONES
  { name: 'Té ilumine english breakfast caja 15u', unit_label: 'caja', min_stock_alert: 3, codigo_havanna: '1718' },
  { name: 'Té silencio andino verde orienta caja 15u', unit_label: 'caja', min_stock_alert: 3, codigo_havanna: '1719' },
  { name: 'Té chamai chai negro india caja 15u', unit_label: 'caja',  min_stock_alert: 3,  codigo_havanna: '1720' },
  { name: 'Té inti grey earl grey caja 15u',    unit_label: 'caja',   min_stock_alert: 3,  codigo_havanna: '1721' },
  { name: 'Té relax cedrón manzanilla caja 15u', unit_label: 'caja',  min_stock_alert: 3,  codigo_havanna: '1722' },
  // OTROS
  { name: 'Waffle belga x un',                  unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '600871' },
  { name: 'Frutos del bosque natural 720g',     unit_label: 'unidad', min_stock_alert: 3,  codigo_havanna: '601864' },
  { name: 'Granola c/frutas y fibras Bolsa 3kg', unit_label: 'unidad', min_stock_alert: 3, codigo_havanna: '601901' },
  { name: 'Jugo banana frutilla granada x500cc', unit_label: 'unidad', min_stock_alert: 5, codigo_havanna: '602722' },
  { name: 'Jugo arándanos naranja x500cc',      unit_label: 'unidad', min_stock_alert: 5,  codigo_havanna: '602723' },
]

const GRANDWICH: { name: string; codigo: string }[] = [
  { name: 'Mixto Jamón y Mozz x12',          codigo: 'UN217' },
  { name: 'Sellado Clásico',                 codigo: 'UN401' },
  { name: 'Sellado Pizza',                   codigo: 'UN402' },
  { name: 'Ciabatta Milanesa',               codigo: 'UN269' },
  { name: 'Ciabatta c/Veg Grill y Provo',    codigo: 'UN283' },
  { name: 'Ciabatta de Vacío',               codigo: 'UN284' },
  { name: 'Ciabatta de Jamón Crudo',         codigo: 'UN289' },
  { name: 'Medialuna c/Jamón y Queso',       codigo: 'UN294' },
  { name: 'Croque Monsieur',                 codigo: 'UN299' },
  { name: 'Haireado de Peceto',              codigo: 'UN350' },
  { name: 'Haireado de Lomo',                codigo: 'UN351' },
  { name: 'Haireado de Pollo',               codigo: 'UN353' },
  { name: 'Hamburguesa Gourmet',             codigo: 'UN501' },
  { name: 'Ensalada Cheff',                  codigo: 'UN006' },
  { name: 'Ensalada Caesar',                 codigo: 'UN007' },
  { name: 'Ensalada Mix de Vegetales',       codigo: 'UN026' },
  { name: 'Lasagna Bolognesa',               codigo: 'HV610' },
  { name: 'Risotto de Calabaza',             codigo: 'HV612' },
]

const AXION: { name: string; codigo: string; unit_label: string }[] = [
  { name: 'Panceta Desayuno FC AFS x300f',         codigo: 'AFS-00027',      unit_label: 'unidad' },
  { name: 'Cinnamon Roll',                          codigo: 'AFS-00064',      unit_label: 'unidad' },
  { name: 'Pain au Chocolat',                       codigo: 'AFS-00065',      unit_label: 'unidad' },
  { name: 'Hellmanns Mayonesa Sachet 196x7.6g',    codigo: 'AFS-00603',      unit_label: 'caja'   },
  { name: 'Hellmanns Mayonesa Clásica DP 15x475g', codigo: 'AFS-00607',      unit_label: 'caja'   },
  { name: 'Hellmanns Ketchup Sachet 196x8g',       codigo: 'AFS-00634',      unit_label: 'caja'   },
  { name: 'Savora Mostaza Sachet 196x8g',          codigo: 'AFS-00650',      unit_label: 'caja'   },
  { name: 'Queso Crema Doble Crema',               codigo: 'AFS003-00026',   unit_label: 'unidad' },
  { name: 'Aceite Oliva 108un x10cc',              codigo: 'AFS010-70490',   unit_label: 'caja'   },
  { name: 'Aceite Maíz 108un x10cc',               codigo: 'AFS010-70506',   unit_label: 'caja'   },
  { name: 'Aceto 108un x10cc',                     codigo: 'AFS010-70513',   unit_label: 'caja'   },
  { name: 'Jugo de Limón',                         codigo: 'AFS010-70575',   unit_label: 'unidad' },
  { name: 'Leche Condensada 24x395gr',             codigo: 'AFS-12564623',   unit_label: 'caja'   },
  { name: 'Leche de Almendras 12un x1L',           codigo: 'AFS-1688',       unit_label: 'caja'   },
  { name: 'Leche Entera LS 12x1L',                 codigo: 'AFS-363008',     unit_label: 'caja'   },
  { name: 'Leche Descremada LS UAT 12x1L',         codigo: 'AFS-363107',     unit_label: 'caja'   },
  { name: 'Saborizante Syrup Vainilla 1L',         codigo: 'AFS-470032',     unit_label: 'unidad' },
  { name: 'Saborizante Syrup Caramelo 1L',         codigo: 'AFS-470049',     unit_label: 'unidad' },
  { name: 'Saborizante Syrup Avellanas 1L',        codigo: 'AFS-470056',     unit_label: 'unidad' },
  { name: 'Concentrado Jengibre x1L',              codigo: 'AFS-470353',     unit_label: 'unidad' },
  { name: 'Base Chocolatada x1L',                  codigo: 'AFS-472081',     unit_label: 'unidad' },
  { name: 'Variegato de Maracuyá x400g',           codigo: 'AFS-473491',     unit_label: 'unidad' },
  { name: 'Salsa Pera Man Limón Matcha 1L',        codigo: 'AFS-473507',     unit_label: 'unidad' },
  { name: 'Puré Frutilla Banana Acaí 1L',          codigo: 'AFS-473514',     unit_label: 'unidad' },
  { name: 'Salsa de Pistacho 1L',                  codigo: 'AFS-473590',     unit_label: 'unidad' },
  { name: 'Concentrado Limonada x1kg',             codigo: 'AFS-473613',     unit_label: 'unidad' },
  { name: 'Concentrado Pomelada 1L',               codigo: 'AFS-473743',     unit_label: 'unidad' },
  { name: 'Puré Durazno-Mango-Jengibre 1L',        codigo: 'AFS-473750',     unit_label: 'unidad' },
  { name: 'Puré Kiwi Melón Ananá 1L',              codigo: 'AFS-473767',     unit_label: 'unidad' },
  { name: 'Salsa Banoffe 1L',                      codigo: 'AFS-473828',     unit_label: 'unidad' },
  { name: 'Medialuna de Manteca',                  codigo: 'AFS-600841',     unit_label: 'unidad' },
  { name: 'Medialuna de Grasa',                    codigo: 'AFS-600842',     unit_label: 'unidad' },
  { name: 'Pan de Queso',                          codigo: 'AFS-601746',     unit_label: 'unidad' },
  { name: 'Pan Caserito Blanco',                   codigo: 'AFS-601853',     unit_label: 'unidad' },
  { name: 'Pan Caserito Multicereal',              codigo: 'AFS-601854',     unit_label: 'unidad' },
  { name: 'Muffin Choc y Avellana',                codigo: 'AFS-601868',     unit_label: 'unidad' },
  { name: 'Tarteleta Acelga Cebolla y Morrón',     codigo: 'AFS-601869',     unit_label: 'unidad' },
  { name: 'Tarteleta Calabaza y Mozza',            codigo: 'AFS-601870',     unit_label: 'unidad' },
  { name: 'Tarteleta de Pollo y Puerro',           codigo: 'AFS-601871',     unit_label: 'unidad' },
  { name: 'Tarteleta Quiche Lorraine',             codigo: 'AFS-601891',     unit_label: 'unidad' },
  { name: 'Muffin Vainilla c/DDL',                 codigo: 'AFS-601892',     unit_label: 'unidad' },
  { name: 'Muffin Vegano c/Pasta Maní',            codigo: 'AFS-601893',     unit_label: 'unidad' },
  { name: 'Marquise con DDL y Merengue',           codigo: 'AFS-601899',     unit_label: 'unidad' },
  { name: 'Torta Red Velvet Petit x9',             codigo: 'AFS-601901',     unit_label: 'unidad' },
  { name: 'Mini Torta de Manzana x9',              codigo: 'AFS-601904',     unit_label: 'unidad' },
  { name: 'Cheese Cake',                           codigo: 'AFS-601914',     unit_label: 'unidad' },
  { name: 'Lemon Pie',                             codigo: 'AFS-601915',     unit_label: 'unidad' },
  { name: 'Cookie Coco Caramel x18',               codigo: 'AFS-601922',     unit_label: 'unidad' },
  { name: 'Cookie Puro Chocolate x18',             codigo: 'AFS-601923',     unit_label: 'unidad' },
  { name: 'Cookie Limón Pistacho Amapola',         codigo: 'AFS-601924',     unit_label: 'unidad' },
  { name: 'Torta de Maní x9',                      codigo: 'AFS-601926',     unit_label: 'unidad' },
  { name: 'Bowl Pollo x4',                         codigo: 'AFS-601927',     unit_label: 'unidad' },
  { name: 'Cookie Red Velvet x9',                  codigo: 'AFS-601929',     unit_label: 'unidad' },
  { name: 'Papas Crispers x bolsa',                codigo: 'AFS-605467',     unit_label: 'unidad' },
  { name: 'Budín de Banana y Nuez',                codigo: 'AFS-606059',     unit_label: 'unidad' },
  { name: 'Budín Limón y Arándanos x3',            codigo: 'AFS-606061',     unit_label: 'unidad' },
  { name: 'Pan de Molde en Rodajas XL',            codigo: 'AFS-606062',     unit_label: 'unidad' },
  { name: 'Guacamole Pickers 12un',                codigo: 'AFS-80748',      unit_label: 'unidad' },
  { name: 'Sand Lomito y Queso 20u 190g',          codigo: 'AFS-839',        unit_label: 'unidad' },
  { name: 'Salsa de DDL Libre de Gluten',          codigo: 'AFS-941322',     unit_label: 'unidad' },
  { name: 'Sal Abedul x1000un',                    codigo: 'AFS-970384',     unit_label: 'unidad' },
  { name: 'Almíbar 7 bolsas x1kg',                 codigo: 'AFS-C0130',      unit_label: 'unidad' },
]

async function seedAxion() {
  const { data: cat } = await supabase.from('product_categories').select('id').eq('name', 'external_food').single()
  if (!cat) throw new Error('Categoría external_food no encontrada')

  const inserts = AXION.map(p => ({
    name: p.name,
    category_id: cat.id,
    unit_label: p.unit_label,
    min_stock_alert: 5,
    codigo_havanna: p.codigo,
  } as any))

  const { data: newProducts, error } = await supabase.from('products').insert(inserts).select('id')
  if (error) throw new Error(`Error insertando Axion: ${error.message}`)
  console.log(`Productos Axion insertados: ${newProducts?.length}`)

  const { data: locations } = await supabase.from('locations').select('id')
  if (!locations) throw new Error('No se encontraron locales')

  const stockRows = (newProducts ?? []).flatMap(p =>
    locations.map(l => ({ product_id: p.id, location_id: l.id, quantity: 0 }))
  )
  const { error: stockErr } = await supabase.from('stock').insert(stockRows)
  if (stockErr) throw new Error(`Error insertando stock: ${stockErr.message}`)
  console.log(`Filas de stock creadas: ${stockRows.length}`)
}

async function seedGrandwich() {
  const { data: cat } = await supabase.from('product_categories').select('id').eq('name', 'external_food').single()
  if (!cat) throw new Error('Categoría external_food no encontrada')

  const inserts = GRANDWICH.map(p => ({
    name: p.name,
    category_id: cat.id,
    unit_label: 'porción',
    min_stock_alert: 5,
    codigo_havanna: p.codigo,
  } as any))

  const { data: newProducts, error } = await supabase.from('products').insert(inserts).select('id')
  if (error) throw new Error(`Error insertando Grandwich: ${error.message}`)
  console.log(`Productos Grandwich insertados: ${newProducts?.length}`)

  const { data: locations } = await supabase.from('locations').select('id')
  if (!locations) throw new Error('No se encontraron locales')

  const stockRows = (newProducts ?? []).flatMap(p =>
    locations.map(l => ({ product_id: p.id, location_id: l.id, quantity: 0 }))
  )
  const { error: stockErr } = await supabase.from('stock').insert(stockRows)
  if (stockErr) throw new Error(`Error insertando stock: ${stockErr.message}`)
  console.log(`Filas de stock creadas: ${stockRows.length}`)
}

async function main() {
  // 1. Obtener category_id de havanna
  const { data: cat, error: catErr } = await supabase
    .from('product_categories')
    .select('id')
    .eq('name', 'havanna')
    .single()
  if (catErr || !cat) throw new Error(`No se encontró la categoría havanna: ${catErr?.message}`)
  const categoryId = cat.id
  console.log('Categoría havanna:', categoryId)

  // 2. Obtener IDs de productos havanna actuales
  const { data: oldProducts, error: oldErr } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', categoryId)
  if (oldErr) throw new Error(`Error buscando productos: ${oldErr.message}`)
  const oldIds = (oldProducts ?? []).map(p => p.id)
  console.log(`Productos ficticios a eliminar: ${oldIds.length}`)

  if (oldIds.length > 0) {
    // 3. Borrar movements
    const { error: mErr } = await supabase.from('movements').delete().in('product_id', oldIds)
    if (mErr) throw new Error(`Error borrando movements: ${mErr.message}`)

    // 4. Borrar stock
    const { error: sErr } = await supabase.from('stock').delete().in('product_id', oldIds)
    if (sErr) throw new Error(`Error borrando stock: ${sErr.message}`)

    // 5. Borrar productos
    const { error: pErr } = await supabase.from('products').delete().in('id', oldIds)
    if (pErr) throw new Error(`Error borrando productos: ${pErr.message}`)
    console.log('Productos anteriores eliminados.')
  }

  // 6. Insertar nuevos productos
  const inserts = PRODUCTS.map(p => ({
    name: p.name,
    category_id: categoryId,
    unit_label: p.unit_label,
    min_stock_alert: p.min_stock_alert,
    codigo_havanna: p.codigo_havanna,
  } as any))
  const { data: newProducts, error: insErr } = await supabase
    .from('products')
    .insert(inserts)
    .select('id')
  if (insErr) throw new Error(`Error insertando productos: ${insErr.message}`)
  console.log(`Productos insertados: ${newProducts?.length}`)

  // 7. Obtener locales
  const { data: locations, error: locErr } = await supabase.from('locations').select('id')
  if (locErr || !locations) throw new Error(`Error obteniendo locales: ${locErr?.message}`)

  // 8. Insertar stock en 0 para cada producto × cada local
  const stockRows = (newProducts ?? []).flatMap(p =>
    locations.map(l => ({ product_id: p.id, location_id: l.id, quantity: 0 }))
  )
  const { error: stockErr } = await supabase.from('stock').insert(stockRows)
  if (stockErr) throw new Error(`Error insertando stock: ${stockErr.message}`)
  console.log(`Filas de stock creadas: ${stockRows.length} (${newProducts?.length} productos × ${locations.length} locales)`)

  console.log('✓ Listo.')
}

seedAxion().catch(err => { console.error(err); process.exit(1) })

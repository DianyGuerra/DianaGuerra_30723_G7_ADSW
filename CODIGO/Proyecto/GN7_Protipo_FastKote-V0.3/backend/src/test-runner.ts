import { createServer } from './interfaces/http/server.js';
import { prisma } from './shared/prisma/prisma.js';
import { env } from './shared/config/env.js';

interface TestResult {
  id: string;
  name: string;
  expected: string;
  obtained: string;
  status: 'EXITOSO' | 'FALLIDO';
}

async function runTests() {
  console.log("======================================================================");
  console.log("       INICIANDO LA EJECUCIÓN DEL PLAN DE PRUEBAS - FASTKOTE          ");
  console.log("======================================================================");

  const app = createServer();
  const server = app.listen(0);
  const port = (server.address() as any).port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[ENTORNO] Servidor temporal levantado en: ${baseUrl}\n`);

  const results: TestResult[] = [];

  // Helper para llamadas HTTP
  async function apiCall(path: string, method: string = 'GET', body?: any, token?: string) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const status = response.status;
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    return { status, data };
  }

  // -------------------------------------------------------------------------
  // TC-RF01-01: Autenticación con Rol Válido (Administrador/Empleado)
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF01-01] Ejecutando: Autenticación con Rol Válido...");
    
    // Login Admin
    const adminLogin = await apiCall('/auth/login', 'POST', {
      username: 'admin',
      password: 'Admin123*'
    });
    
    // Login Empleado
    const empleadoLogin = await apiCall('/auth/login', 'POST', {
      username: 'empleado',
      password: 'Empleado123*'
    });

    const adminOk = adminLogin.status === 200 && adminLogin.data?.token && adminLogin.data?.user?.roles.includes('Admin');
    const empleadoOk = empleadoLogin.status === 200 && empleadoLogin.data?.token && empleadoLogin.data?.user?.roles.includes('Empleado');

    const adminMsg = adminOk ? "Admin OK" : `Admin Falló (Status ${adminLogin.status})`;
    const empleadoMsg = empleadoOk ? "Empleado OK" : `Empleado Falló (Status ${empleadoLogin.status})`;

    const obtained = `${adminMsg}, ${empleadoMsg}`;
    
    results.push({
      id: 'TC-RF01-01',
      name: 'Autenticación con Rol Válido (Administrador/Empleado)',
      expected: 'Ambos logins retornan status 200, JWT token y roles correspondientes (Admin / Empleado).',
      obtained,
      status: (adminOk && empleadoOk) ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF01-01',
      name: 'Autenticación con Rol Válido (Administrador/Empleado)',
      expected: 'Logins exitosos.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF01-02: Bloqueo de Cuenta por Intentos Fallidos
  // -------------------------------------------------------------------------
  let empleadoToken = '';
  let adminToken = '';
  try {
    console.log("[TC-RF01-02] Ejecutando: Bloqueo de Cuenta por Intentos Fallidos...");

    // Asegurar estado inicial limpio para el usuario empleado
    await prisma.user.update({
      where: { username: 'empleado' },
      data: { failedAttempts: 0, lockedUntil: null }
    });

    // Intento 1
    const res1 = await apiCall('/auth/login', 'POST', { username: 'empleado', password: 'PasswordErroneo1' });
    // Intento 2
    const res2 = await apiCall('/auth/login', 'POST', { username: 'empleado', password: 'PasswordErroneo2' });
    // Intento 3 - Debería retornar bloqueo por 5 minutos
    const res3 = await apiCall('/auth/login', 'POST', { username: 'empleado', password: 'PasswordErroneo3' });
    // Intento 4 - Con password correcto, debería ser rechazado por bloqueo
    const res4 = await apiCall('/auth/login', 'POST', { username: 'empleado', password: 'Empleado123*' });

    // Verificar en BD si se registró el bloqueo
    const userDb = await prisma.user.findUnique({ where: { username: 'empleado' } });
    const isLockedInDb = userDb && userDb.failedAttempts >= 3 && userDb.lockedUntil && userDb.lockedUntil > new Date();

    const ok3 = res3.status === 401 && res3.data?.message?.includes('Usuario bloqueado por 5 minutos.');
    const ok4 = res4.status === 423 && res4.data?.message?.includes('Usuario bloqueado temporalmente por intentos fallidos.');

    const obtained = `Intento 3 status: ${res3.status} ("${res3.data?.message}"). Intento 4 status: ${res4.status} ("${res4.data?.message}"). BD bloqueada: ${isLockedInDb ? 'Sí' : 'No'}`;

    results.push({
      id: 'TC-RF01-02',
      name: 'Bloqueo de Cuenta por Intentos Fallidos',
      expected: 'Al 3er intento fallido retorna 401 "Usuario bloqueado...". Al 4to intento con contraseña correcta retorna 423 (Locked).',
      obtained,
      status: (ok3 && ok4 && isLockedInDb) ? 'EXITOSO' : 'FALLIDO'
    });

    // Restaurar usuario para las pruebas siguientes
    await prisma.user.update({
      where: { username: 'empleado' },
      data: { failedAttempts: 0, lockedUntil: null }
    });

    // Obtener tokens para las siguientes pruebas
    const loginEmpleado = await apiCall('/auth/login', 'POST', { username: 'empleado', password: 'Empleado123*' });
    empleadoToken = loginEmpleado.data?.token || '';

    const loginAdmin = await apiCall('/auth/login', 'POST', { username: 'admin', password: 'Admin123*' });
    adminToken = loginAdmin.data?.token || '';

  } catch (e: any) {
    results.push({
      id: 'TC-RF01-02',
      name: 'Bloqueo de Cuenta por Intentos Fallidos',
      expected: 'Bloqueo y rechazo temporal.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF03-01: Creación de Cliente Exitoso con Consentimiento LOPDP
  // -------------------------------------------------------------------------
  let createdClientId = '';
  const testId = '1799999999';
  try {
    console.log("[TC-RF03-01] Ejecutando: Creación de Cliente Exitoso con Consentimiento LOPDP...");

    // Limpiar cliente de prueba previo si existe
    const existing = await prisma.client.findUnique({ where: { identification: testId } });
    if (existing) {
      await prisma.client.delete({ where: { id: existing.id } });
    }

    const res = await apiCall('/clients', 'POST', {
      type: 'NATURAL',
      fullName: 'Juan Pérez LOPDP Test',
      identification: testId,
      email: 'juan.perez@test.com',
      phone: '0987654321',
      address: 'Av. Amazonas, Quito',
      privacyConsent: true
    }, empleadoToken);

    const clientDb = await prisma.client.findUnique({ where: { identification: testId } });
    const privacyConsentOk = clientDb?.privacyConsent === true;
    const ok = res.status === 201 && res.data?.id && privacyConsentOk;

    if (clientDb) {
      createdClientId = clientDb.id;
    }

    results.push({
      id: 'TC-RF03-01',
      name: 'Creación de Cliente Exitoso con Consentimiento LOPDP',
      expected: 'Cliente creado con éxito (201). El campo privacy_consent se registra como true en la base de datos.',
      obtained: `Status: ${res.status}, ID: ${res.data?.id || 'null'}, privacyConsent en BD: ${privacyConsentOk}`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF03-01',
      name: 'Creación de Cliente Exitoso con Consentimiento LOPDP',
      expected: 'Cliente registrado con consentimiento.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF12-01: Cotización con Paquete por Niño y Cantidad menor al Mínimo
  // -------------------------------------------------------------------------
  let createdQuoteId = '';
  try {
    console.log("[TC-RF12-01] Ejecutando: Cotización con Paquete por Niño (menor al mínimo)...");

    // "Combo Día del Niño Básico" tiene id '85811fd0-8533-46b9-b03a-99af9da552be', pricePerChild = 5.00, minChildren = 20
    const packageId = (await prisma.catalogPackage.findFirst({ where: { name: 'Combo Día del Niño Básico' } }))?.id || '85811fd0-8533-46b9-b03a-99af9da552be';
    const clientId = createdClientId || (await prisma.client.findFirst())?.id;

    if (!clientId) {
      throw new Error("No hay clientes disponibles para asociar la cotización.");
    }

    // Fecha válida a futuro
    const eventDate = '2026-11-20';

    const res = await apiCall('/quotes', 'POST', {
      clientId,
      eventDate,
      eventType: 'Dia del Niño',
      packageId,
      childrenCount: 15, // Menor al mínimo de 20
      discount: 0
    }, empleadoToken);

    // Esperado: calcula usando mínimo de 20.
    // Subtotal: 20 * 5.00 = 100.00
    // Tax (15%): 15.00
    // Total: 115.00
    const subtotal = Number(res.data?.subtotal ?? 0);
    const tax = Number(res.data?.tax ?? 0);
    const total = Number(res.data?.total ?? 0);

    const calcOk = subtotal === 100 && tax === 15 && total === 115;
    const ok = res.status === 201 && calcOk;

    if (res.data?.id) {
      createdQuoteId = res.data.id;
    }

    results.push({
      id: 'TC-RF12-01',
      name: 'Cotización con Paquete por Niño y Cantidad menor al Mínimo',
      expected: 'La estrategia aplica la cantidad mínima (20). Subtotal: $100.00, IVA (15%): $15.00, Total: $115.00.',
      obtained: `Status: ${res.status}, Subtotal: $${subtotal}, IVA: $${tax}, Total: $${total}`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF12-01',
      name: 'Cotización con Paquete por Niño y Cantidad menor al Mínimo',
      expected: 'Cálculo ajustado al mínimo.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF13-01: Bloqueo de Modificación de Cotización no Borrador
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF13-01] Ejecutando: Bloqueo de Modificación de Cotización no Borrador...");

    if (!createdQuoteId) {
      throw new Error("No se creó una cotización en el paso anterior para modificar.");
    }

    // Cambiar estado a SENT (enviada)
    await apiCall(`/quotes/${createdQuoteId}/status`, 'PATCH', { status: 'SENT' }, empleadoToken);

    // Intentar modificarla usando PUT (debe ser permitido según el nuevo requerimiento)
    const res = await apiCall(`/quotes/${createdQuoteId}`, 'PUT', {
      eventType: 'Actualización permitida',
      discount: 10
    }, empleadoToken);

    const ok = res.status === 200;

    results.push({
      id: 'TC-RF13-01',
      name: 'Modificación de Cotización después de Realizada (SENT)',
      expected: 'API retorna status 200 permitiendo la edición de la cotización ya realizada.',
      obtained: `Status: ${res.status}, EventType: "${res.data?.eventType}"`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF13-01',
      name: 'Bloqueo de Modificación de Cotización no Borrador',
      expected: 'Rechazo de modificación de cotización no-borrador.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF14-01: Bloqueo de Agenda tras Aceptación de Cotización
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF14-01] Ejecutando: Bloqueo de Agenda tras Aceptación...");

    if (!createdQuoteId) {
      throw new Error("No hay cotización para probar el cambio de estado.");
    }

    // Cambiar estado de la cotización a ACCEPTED
    const res = await apiCall(`/quotes/${createdQuoteId}/status`, 'PATCH', { status: 'ACCEPTED' }, empleadoToken);

    // Consultar en la base de datos si existe una reserva bloqueada asociada a esta cotización
    const reservation = await prisma.eventReservation.findUnique({
      where: { quoteId: createdQuoteId }
    });

    const isBlocked = reservation && reservation.status === 'BLOCKED';
    const ok = res.status === 200 && isBlocked;

    results.push({
      id: 'TC-RF14-01',
      name: 'Bloqueo de Agenda tras Aceptación de Cotización',
      expected: 'La cotización cambia a ACCEPTED y se genera un registro en la tabla event_reservations con status BLOCKED.',
      obtained: `Status respuesta: ${res.status}, Reserva en BD: ${reservation ? `Encontrada (Status: ${reservation.status})` : 'No encontrada'}`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF14-01',
      name: 'Bloqueo de Agenda tras Aceptación de Cotización',
      expected: 'Reserva creada y bloqueada en BD.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF14-02: Liberación de Agenda tras Rechazo o Vencimiento
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF14-02] Ejecutando: Liberación de Agenda tras Rechazo...");

    if (!createdQuoteId) {
      throw new Error("No hay cotización para probar la liberación de la agenda.");
    }

    // Cambiar estado a REJECTED
    const res = await apiCall(`/quotes/${createdQuoteId}/status`, 'PATCH', { status: 'REJECTED' }, empleadoToken);

    // Consultar si la reserva cambió a RELEASED en la base de datos
    const reservation = await prisma.eventReservation.findUnique({
      where: { quoteId: createdQuoteId }
    });

    const isReleased = reservation && reservation.status === 'RELEASED';
    const ok = res.status === 200 && isReleased;

    results.push({
      id: 'TC-RF14-02',
      name: 'Liberación de Agenda tras Rechazo o Vencimiento',
      expected: 'La cotización cambia a REJECTED y el estado de la reserva en event_reservations se actualiza a RELEASED.',
      obtained: `Status respuesta: ${res.status}, Reserva en BD: ${reservation ? `Encontrada (Status: ${reservation.status})` : 'No encontrada'}`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF14-02',
      name: 'Liberación de Agenda tras Rechazo o Vencimiento',
      expected: 'Reserva actualizada a RELEASED en BD.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF14-03: Descuento y Devolución de Stock tras Aceptación/Rechazo con Paquetes Integrales
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF14-03] Ejecutando: Descuento y Devolución de Stock...");

    const testItem = await prisma.inventoryItem.create({
      data: {
        name: 'Insumo de prueba stock ' + Date.now(),
        unit: 'u',
        brand: 'TestBrand',
        currentCost: 1.50,
        stock: 100
      }
    });

    const testService = await prisma.serviceCatalog.create({
      data: {
        type: 'SERVICE',
        name: 'Servicio de prueba stock ' + Date.now(),
        description: 'Servicio de prueba',
        suggestedPrice: 20.00,
        components: {
          create: {
            name: 'Componente de prueba',
            unit: 'u',
            quantity: 2,
            unitCost: 1.50,
            inventoryItemId: testItem.id
          }
        }
      }
    });

    const testPackage = await prisma.catalogPackage.create({
      data: {
        name: 'Paquete de prueba stock ' + Date.now(),
        description: 'Paquete de prueba',
        marginPercent: 0,
        minPrice: 120.00,
        basePrice: 120.00,
        eventTypes: ['Cumpleaños infantil'],
        items: {
          create: [
            {
              name: 'Insumo del paquete',
              category: 'Insumo',
              unit: 'u',
              quantity: 5,
              basePrice: 1.50,
              inventoryItemId: testItem.id
            },
            {
              name: 'Servicio del paquete',
              category: 'Servicio',
              unit: 'Servicio',
              quantity: 1,
              basePrice: 20.00,
              serviceId: testService.id
            }
          ]
        }
      }
    });

    const testClient = await prisma.client.findFirst();
    if (!testClient) throw new Error("No client available for stock test.");

    const quoteRes = await apiCall('/quotes', 'POST', {
      clientId: testClient.id,
      eventDate: '2026-12-15',
      eventType: 'Cumpleaños infantil',
      packageId: testPackage.id,
      childrenCount: 10,
      discount: 0
    }, empleadoToken);

    if (quoteRes.status !== 201) {
      throw new Error(`Error al crear cotización de prueba de stock: ${quoteRes.status}`);
    }

    const testQuoteId = quoteRes.data.id;

    await apiCall(`/quotes/${testQuoteId}/status`, 'PATCH', { status: 'ACCEPTED' }, empleadoToken);

    const afterAcceptItem = await prisma.inventoryItem.findUnique({ where: { id: testItem.id } });
    const stockAfterAccept = afterAcceptItem?.stock ?? 0;

    await apiCall(`/quotes/${testQuoteId}/status`, 'PATCH', { status: 'REJECTED' }, empleadoToken);

    const afterRejectItem = await prisma.inventoryItem.findUnique({ where: { id: testItem.id } });
    const stockAfterReject = afterRejectItem?.stock ?? 0;

    await prisma.quote.delete({ where: { id: testQuoteId } });
    await prisma.catalogPackage.delete({ where: { id: testPackage.id } });
    await prisma.serviceCatalog.delete({ where: { id: testService.id } });
    await prisma.inventoryItem.delete({ where: { id: testItem.id } });

    const deductionOk = stockAfterAccept === 30;
    const refundOk = stockAfterReject === 100;
    const ok = deductionOk && refundOk;

    results.push({
      id: 'TC-RF14-03',
      name: 'Descuento y Devolución de Stock tras Aceptación/Rechazo de Cotización',
      expected: 'Stock inicial 100 reduce a 30 tras aceptación de cotización con 10 personas, y vuelve a 100 tras rechazo.',
      obtained: `Stock tras aceptación: ${stockAfterAccept} (esperado 30), Stock tras rechazo: ${stockAfterReject} (esperado 100)`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF14-03',
      name: 'Descuento y Devolución de Stock tras Aceptación/Rechazo de Cotización',
      expected: 'Deducción y devolución exitosa de stock.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // TC-RF15-01: Simulación de Envío de WhatsApp en Ausencia de Variables
  // -------------------------------------------------------------------------
  try {
    console.log("[TC-RF15-01] Ejecutando: Simulación de Envío de WhatsApp...");

    if (!createdQuoteId) {
      throw new Error("No hay cotización para probar el envío.");
    }

    // Guardar temporalmente las variables de entorno reales
    const savedUrl = env.WHATSAPP_API_URL;
    const savedToken = env.WHATSAPP_API_TOKEN;

    // Forzar la simulación vaciando las variables de entorno
    (env as any).WHATSAPP_API_URL = '';
    (env as any).WHATSAPP_API_TOKEN = '';

    // Invocar el endpoint de WhatsApp
    const res = await apiCall(`/quotes/${createdQuoteId}/send-whatsapp`, 'POST', {}, empleadoToken);

    // Restaurar variables de entorno
    (env as any).WHATSAPP_API_URL = savedUrl;
    (env as any).WHATSAPP_API_TOKEN = savedToken;

    const isSimulated = res.data && res.data.simulated === true;
    const ok = res.status === 200 && isSimulated;

    results.push({
      id: 'TC-RF15-01',
      name: 'Simulación de Envío de WhatsApp en Ausencia de Variables',
      expected: 'El backend retorna status 200 y un objeto conteniendo simulated = true indicando el envío exitoso simulado.',
      obtained: `Status: ${res.status}, Payload: ${JSON.stringify(res.data)}`,
      status: ok ? 'EXITOSO' : 'FALLIDO'
    });
  } catch (e: any) {
    results.push({
      id: 'TC-RF15-01',
      name: 'Simulación de Envío de WhatsApp en Ausencia de Variables',
      expected: 'Respuesta con bandera simulated en true.',
      obtained: `Excepción: ${e.message}`,
      status: 'FALLIDO'
    });
  }

  // -------------------------------------------------------------------------
  // LIMPIEZA DE DATOS FINALES
  // -------------------------------------------------------------------------
  console.log("\n[LIMPIEZA] Eliminando registros creados durante las pruebas...");
  try {
    if (createdQuoteId) {
      // Eliminar reserva asociada
      await prisma.eventReservation.deleteMany({ where: { quoteId: createdQuoteId } });
      // Eliminar ítems de la cotización
      await prisma.quoteItem.deleteMany({ where: { quoteId: createdQuoteId } });
      // Eliminar cotización
      await prisma.quote.delete({ where: { id: createdQuoteId } });
      console.log(`- Cotización ${createdQuoteId} y dependencias eliminadas.`);
    }
    if (createdClientId) {
      // Eliminar cliente
      await prisma.client.delete({ where: { id: createdClientId } });
      console.log(`- Cliente de prueba ${createdClientId} eliminado.`);
    }
    console.log("[LIMPIEZA] Finalizada correctamente.");
  } catch (cleanError: any) {
    console.error(`[LIMPIEZA] Error al limpiar base de datos: ${cleanError.message}`);
  }

  // Cerrar servidores y conexiones
  server.close();
  await prisma.$disconnect();

  console.log("\n======================================================================");
  console.log("                      RESUMEN DE LA EJECUCIÓN                         ");
  console.log("======================================================================");
  let passedCount = 0;
  for (const r of results) {
    const statusStr = r.status === 'EXITOSO' ? '\x1b[32mPASSED\x1b[0m' : '\x1b[31mFAILED\x1b[0m';
    console.log(`[${r.id}] ${r.name.padEnd(65)}: [${statusStr}]`);
    if (r.status === 'EXITOSO') passedCount++;
  }
  
  const total = results.length;
  const rate = ((passedCount / total) * 100).toFixed(2);
  console.log(`\nTasa de éxito global: ${passedCount} / ${total} (${rate}%)`);
  console.log("======================================================================");

  // Escribir un reporte JSON legible para poder parsear si es necesario
  const reportPath = new URL('./test-report.json', import.meta.url);
  const fs = await import('fs');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    passedCount,
    total,
    rate: `${rate}%`,
    results
  }, null, 2));
  console.log(`Reporte detallado guardado en: ${reportPath.pathname}`);
}

runTests().catch(console.error);

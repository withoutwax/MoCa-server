# Debugging Manual 🐞

This project provides convenient tools similar to "Rails Console" to easily verify data and test business logic directly from the terminal.

## 1. NestJS REPL (Logic Testing)

Interact with the NestJS application context (Services, Repositories) in a REPL environment.

### **How to Start**

```bash
npm run console
```

### **Usage Examples**

Once inside the REPL, you can access any provider using `get()`.

**1. Database Query (Prisma)**

```typescript
// Get Prisma Service
const prisma = get(PrismaService);
// Query Users
await prisma.user.findMany();
// Query Cards
await prisma.card.findFirst();
```

**2. Test OCR Service**

```typescript
const ocr = get(OcrService);
// Manual extraction test
await ocr.extractText(Buffer.from('...'));
```

---

## 2. Prisma Studio (Data Viewer)

A GUI tool to view and edit database records visually (like Excel).

### **How to Start**

```bash
npm run db:viewer
```

- Opens automatically at [http://localhost:5555](http://localhost:5555).

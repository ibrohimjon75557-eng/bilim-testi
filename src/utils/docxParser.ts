import JSZip from 'jszip';
import { ParsedDocxQuestion, QuestionType } from '../types';

/**
 * Word (.docx) faylidan matnni ajratib olish va savollarni tahlil qilish.
 * Qo'llab-quvvatlanadigan format:
 *
 * 1. Savol matni?
 * A) variant
 * *B) to'g'ri variant
 * C) variant
 * D) variant
 * Izoh: ixtiyoriy izoh matni
 */
export async function extractTextFromDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXml = zip.file('word/document.xml');

  if (!docXml) {
    throw new Error('Yaroqsiz .docx fayl: word/document.xml topilmadi');
  }

  const xmlText = await docXml.async('text');
  // Paragraflarni <w:p> bo'yicha ajratish
  const paragraphs: string[] = [];
  const pRegex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  let pMatch: RegExpExecArray | null;

  while ((pMatch = pRegex.exec(xmlText)) !== null) {
    const pContent = pMatch[0];
    const tRegex = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
    let tMatch: RegExpExecArray | null;
    let line = '';
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      line += decodeXmlEntities(tMatch[1]);
    }
    if (line.trim()) {
      paragraphs.push(line.trim());
    }
  }

  return paragraphs.join('\n');
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function parseQuestionsFromText(rawText: string): ParsedDocxQuestion[] {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const results: ParsedDocxQuestion[] = [];
  let currentQuestion: {
    question_text: string;
    answers: { answer_text: string; is_correct: boolean }[];
    explanation: string;
    points: number;
  } | null = null;

  // Savol boshlanishi: "1. Savol" yoki "1) Savol"
  const questionStartRegex = /^(\d+)[\.\)]\s*(.*)$/;
  // Variant qatori: "*A) variant" yoki "A) variant" yoki "*B. variant"
  const optionRegex = /^(\*)?\s*([A-Da-d])[\.\)]\s*(.*)$/;
  // Izoh qatori: "Izoh: ..."
  const explanationRegex = /^(?:Izoh|Explanation|Tushuntirish)\s*:\s*(.*)$/i;

  const flushCurrent = () => {
    if (!currentQuestion) return;
    const errors: string[] = [];
    const qText = currentQuestion.question_text.trim();

    if (!qText) {
      errors.push('Savol matni bo‘sh');
    }

    const ansCount = currentQuestion.answers.length;
    if (ansCount < 2) {
      errors.push('Variantlar yetishmaydi (kamida 2 ta variant bo‘lishi shart)');
    }

    const correctCount = currentQuestion.answers.filter((a) => a.is_correct).length;
    if (correctCount === 0) {
      errors.push('To‘g‘ri javob belgilanmagan (* belgisi yo‘q)');
    } else if (correctCount > 1) {
      errors.push(`Bir nechta to‘g‘ri javob belgilangan (${correctCount} ta)`);
    }

    const emptyAnswer = currentQuestion.answers.some((a) => !a.answer_text.trim());
    if (emptyAnswer) {
      errors.push('Ba’zi variantlarning matni bo‘sh');
    }

    let qType: QuestionType = 'single_choice';
    if (
      ansCount === 2 &&
      currentQuestion.answers.some((a) => /to['‘`]?g['‘`]?ri|true/i.test(a.answer_text))
    ) {
      qType = 'true_false';
    }

    results.push({
      tempId: `import-${results.length + 1}-${Date.now()}`,
      question_text: qText,
      question_type: qType,
      points: currentQuestion.points || 10,
      explanation: currentQuestion.explanation.trim(),
      answers: currentQuestion.answers,
      errors,
    });
    currentQuestion = null;
  };

  for (const line of lines) {
    const qMatch = line.match(questionStartRegex);
    if (qMatch) {
      flushCurrent();
      currentQuestion = {
        question_text: qMatch[2] || '',
        answers: [],
        explanation: '',
        points: 10,
      };
      continue;
    }

    const optMatch = line.match(optionRegex);
    if (optMatch) {
      if (!currentQuestion) {
        currentQuestion = {
          question_text: '',
          answers: [],
          explanation: '',
          points: 10,
        };
      }
      const isCorrect = Boolean(optMatch[1]);
      const ansText = (optMatch[3] || '').trim();
      currentQuestion.answers.push({
        answer_text: ansText,
        is_correct: isCorrect,
      });
      continue;
    }

    const expMatch = line.match(explanationRegex);
    if (expMatch && currentQuestion) {
      currentQuestion.explanation = expMatch[1] || '';
      continue;
    }

    // Agar variantlar hali boshlanmagan bo'lsa, savol matnining davomi deb hisoblaymiz
    if (currentQuestion && currentQuestion.answers.length === 0) {
      currentQuestion.question_text += (currentQuestion.question_text ? ' ' : '') + line;
    } else if (!currentQuestion) {
      // Format noto'g'ri qator
      currentQuestion = {
        question_text: line,
        answers: [],
        explanation: '',
        points: 10,
      };
    }
  }

  flushCurrent();
  return results;
}

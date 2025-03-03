import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import Editor, { useMonaco } from '@monaco-editor/react';
import { MachineVariable } from '@/lib/machines';
import type { editor } from 'monaco-editor';

interface MonacoEditorProps {
  formula: string;
  onChange: (value: string) => void;
  variables: MachineVariable[];
  height?: string;
  showLineNumbers?: boolean;
  borderStyle?: 'paper' | 'outline';
}

interface CursorPosition {
  lineNumber: number;
  column: number;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  formula,
  onChange,
  variables,
  height = '200px',
  showLineNumbers = false,
  borderStyle = 'outline'
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ lineNumber: 1, column: 1 });

  useEffect(() => {
    if (!monaco) return;
    
    monaco.languages.register({ id: 'formulaLanguage' });
    
    const disposable = monaco.languages.registerCompletionItemProvider('formulaLanguage', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        
        const variableSuggestions = variables.map(variable => ({
          label: variable.name,
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: `${variable.displayName} (${variable.unit})`,
          documentation: variable.additionalInfo,
          insertText: variable.name,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: Math.max(1, position.column - word.word.length),
            endColumn: position.column
          }
        }));
        
        const mathFunctions = [
          { label: 'sin', documentation: 'Sine function' },
          { label: 'cos', documentation: 'Cosine function' },
          { label: 'tan', documentation: 'Tangent function' },
          { label: 'abs', documentation: 'Absolute value' },
          { label: 'sqrt', documentation: 'Square root' },
          { label: 'max', documentation: 'Maximum value', insertText: 'max(${1:x}, ${2:y})' },
          { label: 'min', documentation: 'Minimum value', insertText: 'min(${1:x}, ${2:y})' },
          { label: 'pow', documentation: 'Power function', insertText: 'pow(${1:base}, ${2:exponent})' },
        ];
        
        const mathSuggestions = mathFunctions.map(fn => ({
          label: fn.label,
          kind: monaco.languages.CompletionItemKind.Function,
          documentation: fn.documentation,
          insertText: fn.insertText || fn.label,
          insertTextRules: fn.insertText?.includes('$') 
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet 
            : undefined,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: Math.max(1, position.column - word.word.length),
            endColumn: position.column
          }
        }));
        
        return {
          suggestions: [...variableSuggestions, ...mathSuggestions]
        };
      },
      triggerCharacters: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 
                         'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
                         'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                         'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    });
    
    return () => {
      disposable.dispose();
    };
  }, [monaco, variables]);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    editor.focus();

    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  const editorContent = (
    <Editor
      height={height}
      defaultLanguage="formulaLanguage"
      defaultValue={formula}
      value={formula}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        lineNumbers: showLineNumbers ? 'on' : 'off',
        folding: false,
        wordWrap: 'on',
        wrappingIndent: 'indent',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: 'Consolas, "Courier New", monospace',
        fontWeight: 'normal',
        suggestFontSize: 14,
        suggestLineHeight: 20,
        padding: { top: 12, bottom: 12 },
        suggestSelection: 'first',
        suggest: {
          showIcons: true,
          showStatusBar: false,
          preview: true,
          previewMode: 'prefix',
          filterGraceful: false,
          snippetsPreventQuickSuggestions: false,
          localityBonus: true,
          shareSuggestSelections: true,
          insertMode: 'insert'
        },
        renderWhitespace: 'none',
        renderControlCharacters: false,
        scrollbar: {
          useShadows: false,
          vertical: 'auto',
          horizontal: 'auto',
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
      }}
      data-testid="formula-editor-input"
    />
  );

  if (borderStyle === 'paper') {
    return (
      <Paper elevation={2} sx={{ border: 1, borderColor: 'divider' }}>
        {editorContent}
      </Paper>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'grey.400',
      borderRadius: 1,
      backgroundColor: 'background.paper',
      '&:hover': {
        borderColor: 'primary.main',
      },
      position: 'relative',
      '& .monaco-editor .suggest-widget': {
        zIndex: 1500,
        marginTop: '1.5em !important',
        top: '100% !important'
      }
    }}>
      <Box sx={{ height }}>
        {editorContent}
      </Box>
      <Box sx={{ 
        borderTop: '1px solid',
        borderColor: 'grey.300',
        px: 1,
        py: 0.5,
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'grey.50'
      }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
          Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
        </Typography>
      </Box>
    </Box>
  );
};

export default MonacoEditor; 
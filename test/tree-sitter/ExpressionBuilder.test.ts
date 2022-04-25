import { CucumberExpression, RegularExpression } from '@cucumber/cucumber-expressions'
import assert from 'assert'
import { readFile } from 'fs/promises'
import glob from 'glob'
import path from 'path'

import { ExpressionBuilder, LanguageName } from '../../src/index.js'
import { NodeParserAdapter } from '../../src/tree-sitter/NodeParserAdapter.js'

describe('ExpressionBuilder', () => {
  const expressionBuilder = new ExpressionBuilder(new NodeParserAdapter())

  for (const dir of glob.sync(`test/tree-sitter/testdata/*`)) {
    const language = path.basename(dir) as LanguageName
    it(`builds parameter types and expressions from ${language} source`, async () => {
      const contents = await Promise.all(glob.sync(`${dir}/**/*`).map((f) => readFile(f, 'utf-8')))
      const sources = contents.map((content) => ({
        language,
        content,
      }))
      const expressions = expressionBuilder.build(sources, [])
      assert.deepStrictEqual(
        expressions.map((e) =>
          e instanceof CucumberExpression ? e.source : (e as RegularExpression).regexp
        ),
        language === 'c_sharp'
          ? [
              /a new bowling game/,
              /all of my balls are landing in the gutter/,
              /my total score should be (\d+)/,
              /I roll (\d+) and (\d+)/,
              /I roll the following series:(.*)/,
              /I roll/,
            ]
          : ['a {uuid}', 'a {date}', /^a regexp$/]
      )
    })
  }
})

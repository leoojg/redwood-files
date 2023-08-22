import type { Prisma, File } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.FileCreateArgs>({
  file: {
    one: {
      data: { name: 'String', url: 'String', type: 'String', version: 7152573 },
    },
    two: {
      data: { name: 'String', url: 'String', type: 'String', version: 5673080 },
    },
  },
})

export type StandardScenario = ScenarioData<File, 'file'>

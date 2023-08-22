import { PickerDropPane } from 'filestack-react'
import type { DeleteFileMutationVariables, FindFiles } from 'types/graphql'

import { useMutation } from '@redwoodjs/web'
import { Toaster, toast } from '@redwoodjs/web/toast'

import { QUERY } from 'src/components/File/FilesCell'
import { truncate } from '../../../lib/formatters'

const DELETE_FILE_MUTATION = gql`
  mutation DeleteFileMutation($id: String!) {
    deleteFile(id: $id) {
      id
    }
  }
`

const UPDATE_FILE_MUTATION = gql`
  mutation UpdateFileMutation($id: String!, $input: UpdateFileInput!) {
    updateFile(id: $id, input: $input) {
      id
      name
      url
      type
      version
    }
  }
`

const SEARCH_FILES_MUTATION = gql`
  mutation SearchFilesMutation($searchTerm: String!) {
    searchFiles(query: $searchTerm) {
      id
      name
      url
      type
      version
    }
  }
`

const CREATE_FILE_MUTATION = gql`
  mutation CreateFileMutation($input: CreateFileInput!) {
    createFile(input: $input) {
      id
    }
  }
`

const imageTagSuportedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml']

type fileUploaded = {
  filename: string;
  handle: string;
  mimetype: string;
  originalFile: {
    name: string;
    type: string;
    size: number;
  }
  originalPath: string;
  size: number;
  source: string;
  status: string;
  uploadId: string;
  url: string;
}


const FilesList = ({ files }: FindFiles) => {
  const [deleteFile] = useMutation(DELETE_FILE_MUTATION, {
    onCompleted: () => {
      toast.dismiss();
      toast.success('Arquivo apagado')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    // This refetches the query on the list page. Read more about other ways to
    // update the cache over here:
    // https://www.apollographql.com/docs/react/data/mutations/#making-all-other-cache-updates
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  });

  const [createFile] = useMutation(CREATE_FILE_MUTATION, {
    onCompleted: () => {
      toast.success('Arquivo criado')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [updateFile] = useMutation(UPDATE_FILE_MUTATION, {
    onCompleted: () => {
      toast.success('Arquivo atualizado')
    },
    onError: (error) => {
      toast.error(error.message)
    },
    refetchQueries: [{ query: QUERY }],
    awaitRefetchQueries: true,
  })

  const [searchFIles] = useMutation(SEARCH_FILES_MUTATION, {
    onError: (error) => {
      toast.error(error.message)
    },
  });


  const onDeleteClick = (id: DeleteFileMutationVariables['id'], filename: string) => {
    toast.dismiss();
    toast((t) => (
      <div className='relative transform overflow-hidden text-left'>
        <span className='text-sm text-gray-500'>
          Você tem certeza que deseja deletar o arquivo: <b>{filename}?</b> <br />
          <div className='sm:flex sm:flex-row-reverse mt-5'>
            <button onClick={() => deleteFile({ variables: { id } })} className='inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto'>
              Excluir
            </button>
            <button onClick={() => toast.dismiss(t.id)} className='mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
              Cancelar
            </button>
          </div>
        </span>
      </div>
    ));
  }

  const handleDownload = async (url: string, filename:string) => {
    toast.promise(new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();

        const downloadLink = document.createElement('a');
        const objectURL = URL.createObjectURL(blob);

        downloadLink.href = objectURL;
        downloadLink.download = filename;
        downloadLink.click();

        URL.revokeObjectURL(objectURL);
        resolve('');
      } catch {
        reject();
      }
    }), {
      loading: 'Baixando arquivo...',
      success: 'Arquivo baixado',
      error: 'Ocorreu um erro ao baixar o arquivo',
    });


  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
      <Toaster />
      <div className="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
        <div className="mx-auto max-w-md">
          <PickerDropPane
            apikey={process.env.REDWOOD_ENV_FILESTACK_API_KEY}
            pickerOptions={{
              fromSources: ['local_file_system'],
              maxSize: 10 * 1024 * 1024,
              globalDropZone: true,
              pasteMode: {
                pasteToFirstInViewPort: true,
                pasteToFirstInstance: true
              },
              onUploadDone: ({filesUploaded}: {filesUploaded: Array<fileUploaded>}) => {
                if (filesUploaded.length === 0) return;
                for (const file of filesUploaded) {
                  searchFIles({variables: {searchTerm: file.filename}, onCompleted: (files) => {
                    if (files.searchFiles.length === 0) {
                      createFile({ variables: { input: { name: file.filename, url: file.url, type: file.mimetype, version: 1 } } })
                    } else {
                      updateFile({ variables: { id: files.searchFiles[0].id, input: { name: file.filename, url: file.url, type: file.mimetype, version: files.searchFiles[0].version + 1 } } })
                    }
                  } });
                }
              }
            }}
          />
          <ul className="divide-y divide-gray-100">
            {files.length > 0 &&
              files.map((file) => (
                <li key={file.id} className="flex justify-between gap-x-6 py-5">
                  <div className="flex min-w-0 gap-x-4">
                    {imageTagSuportedTypes.includes(file.type) ? (<img
                      className="h-12 w-12 flex-none rounded-full bg-gray-50"
                      src={file.url}
                      alt=""
                    />) : (<svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 20">
                    <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M6 1v4a1 1 0 0 1-1 1H1m14-4v16a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2Z"/>
                  </svg>)}

                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {truncate(file.name)}
                      </p>
                    </div>
                  </div>
                  <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                    <div className='flex items-center justify-around space-x-2'>
                      <svg className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 19" onClick={() => {
                        handleDownload(file.url, file.name)
                      }}>
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15h.01M4 12H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-3M9.5 1v10.93m4-3.93-4 4-4-4"/>
                      </svg>
                      <svg className="w-6 h-6 text-gray-800 dark:text-white cursor-pointer" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20" onClick={() => {
                        onDeleteClick(file.id, file.name)
                      }}>
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z"/>
                      </svg>
                    </div>

                  </div>
                </li>
              ))}

            {files.length === 0 && (
              <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-16 lg:text-left">
                <h3 className="text-3xl font-bold tracking-tight text-gray-700 sm:text-2xl">
                  Drop files anywhere.
                  <br />
                  Or just click in the area above.
                </h3>
              </div>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FilesList



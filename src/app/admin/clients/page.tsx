'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import DirectoryTree from '../../_components/DirectoryTree';

import './style.css'

type ClientItem = {
  client_id: number;
  username: string;
}

type ProjectItem = {
  project_id: number;
  user_id: number;
  root_dir: number;
  root_file: number;
  name: string;
}

export default function Clients() {
  const [clients, setClients] = useState<ClientItem[]>([])
  const [projects, setProjects] = useState<ProjectItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null)

  const supabase = createClientComponentClient();

  const getClients = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('client_id, username')

    if (error) {
      console.error(error)
      setIsLoading(false)
      return;
    }

    setClients(data)
    setIsLoading(false)
  }

  const getProjects = async (id: string) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('project_id, user_id, root_dir, root_file, name')
      .eq('user_id', id)

    if (error) {
      console.error(error)
      setIsLoading(false)
      return;
    }
    setProjects(data)
    setSelectedClient(id)
    setIsLoading(false)
  }

  const getDirFiles = (project: ProjectItem) => {
    setSelectedProject(project)
  }

  useEffect(() => {
    getClients()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  return clients.length > 0 && (
    <div className="admin-all-clients-main">
      {isLoading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <div className="admin-client-collection">
        <h2>Clients</h2>
        {clients.map((client) => {
          return (
            <div key={client.client_id} className={selectedClient !== `${client.client_id}` ? "admin-single-client" : 'admin-client-selected'} onClick={() => getProjects(`${client.client_id}`)}>
              {client.username}
            </div>
          )
        })}
      </div>
      {projects.length > 0 && (
        <div className="admin-client-collection">
          <h2>Projects</h2>
          {projects.map((project) => {
            return (
              <div key={project.project_id} className="admin-single-client" onClick={() => getDirFiles(project)}>
                {project.name}
              </div>
            )
          })
          }
        </div>
      )}
      {selectedProject && (
        <div className="admin-client-collection-files">
          <h2>Files</h2>
          <DirectoryTree dirId={selectedProject.root_dir} />
        </div>
      )}
    </div>
  )
}
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import DirectoryTree from "../../_components/DirectoryTree";
import AdminFilePreview from "../../_components/AdminFilePreview";
import AdminDirOptions from "../../_components/AdminDirOptions";
import RequestFile from "../../_components/RequestFile";
import getUser from "../../_utils/getUser";

import { FaPlus } from "react-icons/fa";

import "./style.css";

type ClientItem = {
  client_id: number;
  username: string;
};

type ProjectItem = {
  project_id: number;
  user_id: number;
  root_dir: number;
  root_file: number;
  name: string;
};

export default function Clients() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [filePreviewId, setFilePreviewId] = useState("");
  const [selectedDirId, setSelectedDirId] = useState("");
  const [showDirOptions, setShowDirOptions] = useState(false);
  const [refreshTree, setRefreshTree] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  const getClients = async () => {
    const user = await getUser();
    if (user) {
      const { data: userId, error: userIdError } = await supabase
        .from("users")
        .select("admin, client_id")
        .eq("email", user[0].email);

      if (userIdError) {
        console.error(userIdError);
        setIsLoading(false);
        return;
      }

      if (!userId[0].admin) {
        router.replace("/");
      }
      const { data, error } = await supabase
        .from("users")
        .select("client_id, username")
        .neq("client_id", userId[0].client_id)
        .not("admin", "eq", true);

      if (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }

      setClients(data);
    }
    setIsLoading(false);
  };

  const getProjects = async (id: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("project_id, user_id, root_dir, root_file, name")
      .eq("user_id", id);

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }
    setProjects(data);
    setSelectedClient(id);
    setIsLoading(false);
  };

  const handleViewPreview = (value: boolean, id: string) => {
    setFilePreviewId(id);
    setShowPreview(value);
  };

  const getDirFiles = (project: ProjectItem) => {
    setSelectedProject(project);
  };

  const clearPreview = (value: boolean) => {
    if (!value) {
      setRefreshTree((prev) => !prev); // Toggle state to trigger refresh
    }
    setShowPreview(value);
  };

  const handleOptions = (value: boolean, parent: string) => {
    setSelectedDirId(parent);
    setShowDirOptions(value);
    if (!value) {
      setRefreshTree((prev) => !prev); // Toggle state to trigger refresh
    }
  };

  const updateTree = (value: boolean) => {
    if (!value) {
      setRefreshTree((prev) => !prev);
    }
  };

  const handleAddClient = () => {
    router.push("/admin/add-client");
  };

  useEffect(() => {
    setSelectedProject(null);
  }, [selectedClient]);

  useEffect(() => {
    getClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    clients.length > 0 && (
      <div className="admin-all-clients-main">
        {isLoading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        {showDirOptions && selectedDirId && (
          <AdminDirOptions
            parentDirId={selectedDirId}
            projectId={`${selectedProject?.project_id}`}
            userId={selectedClient}
            handleOptions={handleOptions}
          />
        )}

        <div className="admin-section">
          <h2>Clients</h2>
          <div className="admin-client-collection" style={{ zIndex: "10" }}>
            {clients.map((client) => {
              return (
                <div
                  key={client.client_id}
                  className={
                    selectedClient !== `${client.client_id}`
                      ? "admin-single-client"
                      : "admin-client-selected"
                  }
                  onClick={() => getProjects(`${client.client_id}`)}
                >
                  {client.username}
                </div>
              );
            })}
            <button
              type="button"
              className="admin-add-to-collection"
              onClick={handleAddClient}
            >
              <FaPlus />
            </button>
          </div>
        </div>
        {projects.length > 0 && (
          <div className="admin-section">
            <h2>Projects</h2>
            <div
              className={`admin-client-collection ${
                selectedClient ? "sliding-in" : "sliding-out"
              }`}
              style={{ zIndex: "5" }}
            >
              {projects.map((project) => {
                return (
                  <div
                    key={project.project_id}
                    className="admin-single-client"
                    onClick={() => getDirFiles(project)}
                  >
                    {project.name}
                  </div>
                );
              })}
              <button type="button" className="admin-add-to-collection">
                <FaPlus />
              </button>
            </div>
          </div>
        )}
        {selectedProject && (
          <div className="admin-section">
            <h2>Files</h2>
            <div
              className={`admin-client-collection-files ${
                selectedProject ? "sliding-in" : "sliding-out"
              }`}
              style={{ zIndex: "1" }}
            >
              <DirectoryTree
                dirId={selectedProject.root_dir}
                handleViewPreview={handleViewPreview}
                handleOptions={handleOptions}
                refreshTree={refreshTree}
              />
            </div>
          </div>
        )}
        {showPreview && (
          <AdminFilePreview
            fileId={filePreviewId}
            clearPreview={clearPreview}
            refreshTree={refreshTree}
            updateTree={updateTree}
          />
        )}
      </div>
    )
  );
}

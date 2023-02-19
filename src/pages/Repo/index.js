import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Owner,
  Loading,
  BackButton,
  IssuesList,
  PageActions,
  FilterList,
} from "./sytles";
import api from "../../services/api";
import { FaArrowLeft } from "react-icons/fa";

export default function Repo() {
  const { repo } = useParams();

  const [selectedRepo, setSelectedRepo] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState([
    { state: "all", label: "All", active: true },
    { state: "open", label: "Open", active: true },
    { state: "closed", label: "Closed", active: true },
  ]);
  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    async function load() {
      const repoName = decodeURIComponent(repo);

      const [repoData, issuesData] = await Promise.all([
        api.get(`/repos/${repoName}`),
        api.get(`/repos/${repoName}/issues`, {
          params: {
            state: filters.find((f) => f.active).state,
            per_page: 5,
          },
        }),
      ]);
      setSelectedRepo(repoData.data);
      setIssues(issuesData.data);

      setLoading(false);
    }
    load();
  }, [repo]);

  useEffect(() => {
    async function loadIssue() {
      const repoName = decodeURIComponent(repo);

      const response = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters[filterIndex].state,
          page,
          per_page: 5,
        },
      });

      setIssues(response.data);
    }

    loadIssue();
  }, [filters, filterIndex, repo, page]);

  function handlePage(action) {
    setPage(action === "back" ? page - 1 : page + 1);
  }

  function handleFilter(index) {
    setFilterIndex(index);
    console.log(filterIndex);
  }

  if (loading) {
    return (
      <Loading>
        <h1>Loading</h1>
      </Loading>
    );
  }
  return (
    <Container>
      <BackButton to="/">
        <FaArrowLeft color="#000" size={30} />
      </BackButton>
      <Owner>
        <img
          src={selectedRepo.owner.avatar_url}
          alt={selectedRepo.owner.login}
        />
        <h1>{selectedRepo.owner.name}</h1>
        <p>{selectedRepo.description}</p>
      </Owner>
      <FilterList active={filterIndex}>
        {filters.map((filter, index) => (
          <button
            type="button"
            key={filter.label}
            onClick={() => handleFilter(index)}
          >
            {filter.label}
          </button>
        ))}
      </FilterList>
      <IssuesList>
        {issues.map((issue) => (
          <li key={String(issue.id)}>
            <img src={issue.user.avatar_url} alt={issue.user.login} />
            <div>
              <strong>
                <a href={issue.html_url}>{issue.title}</a>
              </strong>
            </div>
          </li>
        ))}
      </IssuesList>
      <PageActions>
        <button
          type="button"
          onClick={() => handlePage("back")}
          disabled={page < 2}
        >
          Back
        </button>

        <button type="button" onClick={() => handlePage("next")}>
          Next
        </button>
      </PageActions>
    </Container>
  );
}

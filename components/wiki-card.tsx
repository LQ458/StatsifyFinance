"use client";
import React from "react";
import { Card, Tag } from "antd";
import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "../src/css/wiki.module.css";

interface WikiCardProps {
  id: string;
  title: string;
  desc: string;
  image: string;
  tags: string[];
  difficulty: string;
}

const WikiCard: React.FC<WikiCardProps> = ({
  id,
  title,
  desc,
  image,
  tags,
  difficulty,
}) => {
  const t = useTranslations("wiki");

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "green";
      case "intermediate":
        return "orange";
      case "advanced":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <Link href={`/wiki/${id}`}>
      <Card
        hoverable
        className={(styles as any).card}
        cover={
          <div className={(styles as any).imageContainer}>
            <img alt={title} src={image} className={(styles as any).image} />
          </div>
        }
      >
        <div className={(styles as any).content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={(styles as any).desc}>{desc}</p>
          <div className={(styles as any).tags}>
            <Tag color={getDifficultyColor(difficulty)}>
              {t(`difficulty.${difficulty}`)}
            </Tag>
            {tags.map((tag, index) => (
              <Tag key={index} color="gold">
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default WikiCard;

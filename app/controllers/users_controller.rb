class UsersController < ApplicationController

  def login
  end

  def classroom
    if params[:name].present?
      @username = params[:name]
      @saved = $redis.get('username')
    else
      redirect_to :root
    end
  end
end
